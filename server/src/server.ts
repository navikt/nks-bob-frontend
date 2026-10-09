import * as oasis from "@navikt/oasis"
import bodyParser from "body-parser"
import compression from "compression"
import { randomUUID } from "crypto"
import express from "express"
import { readFileSync } from "fs"
import { ServerResponse } from "http"
import type { IncomingMessage } from "http"
import type { Socket } from "net"
import { createProxyServer } from "httpxy"
import { createHttpTerminator } from "http-terminator"
import Mustache from "mustache"
import path from "path"
import Prometheus from "@prometheus-io/client"
import { createLogger, format, LeveledLogMethod, transports } from "winston"
import { entraMiddleware, getToken } from "./entra.js"
import require from "./esm-require.js"

const apiMetricsMiddleware = require("prometheus-api-metrics")

require("dotenv").config()

const CALL_ID = "nav-call-id"

export const {
  PORT = 3030,
  NAIS_APP_IMAGE = "?",
  GIT_COMMIT = "?",
  LOGIN_URL = "",
  NAIS_CLUSTER_NAME = "local",
  MILJO = "local",
  NAIS_TOKEN_EXCHANGE_ENDPOINT = "",
} = process.env

const audience =
  {
    dev: "api://dev-gcp.nks-aiautomatisering.nks-bob-api/.default",
    prod: "api://prod-gcp.nks-aiautomatisering.nks-bob-api/.default",
    localnais: "api://dev-gcp.nks-aiautomatisering.nks-bob-api/.default",
  }[MILJO] ?? "localaudience"

const logEventsCounter = new Prometheus.Counter({
  name: "logback_events_total",
  help: "Antall log events fordelt på level",
  labelNames: ["level"],
})

const proxyEventsCounter = new Prometheus.Counter({
  name: "proxy_events_total",
  help: "Antall proxy events",
  labelNames: ["target", "proxystatus", "status", "errcode"],
})

// proxy calls to log.<level> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
const log = new Proxy(
  createLogger({
    transports: [
      new transports.Console({
        format: format.combine(format.splat(), format.json()),
      }),
    ],
  }),
  {
    get: (log, level) => {
      return (...args: any[]) => {
        const levelStr = String(level)
        const logger = (log as any)[levelStr] as LeveledLogMethod

        logEventsCounter.inc({ level: `${levelStr}` })
        return logger(args)
      }
    },
  },
)

const proxyServer = createProxyServer()
const proxyTargets = new WeakMap<IncomingMessage, string>()

proxyServer.on("proxyReq", (proxyReq, _req, res) => {
  if (proxyReq.getHeader("cookie")) {
    proxyReq.removeHeader("cookie")
  }
  if (!proxyReq.hasHeader(CALL_ID)) {
    proxyReq.appendHeader(CALL_ID, randomUUID())
  }
  const authHeader = res.getHeader("Authorization")
  if (typeof authHeader === "string") {
    proxyReq.setHeader("Authorization", authHeader)
    res.removeHeader("Authorization")
  }
})

proxyServer.on("proxyReqWs", (proxyReq) => {
  if (proxyReq.getHeader("cookie")) {
    proxyReq.removeHeader("cookie")
  }
  if (!proxyReq.hasHeader(CALL_ID)) {
    proxyReq.appendHeader(CALL_ID, randomUUID())
  }
})

proxyServer.on("error", (err, req, res, target) => {
  const code = (err as NodeJS.ErrnoException).code
  const targetHost =
    target instanceof URL
      ? target.host
      : typeof target === "string"
        ? new URL(target).host
        : (target?.host ?? target?.hostname)
  const status = res instanceof ServerResponse ? res.statusCode : undefined
  const level =
    code && (/HPE_INVALID/.test(code) || ["ECONNRESET", "ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"].includes(code))
      ? "warn"
      : "error"

  proxyEventsCounter.inc({
    target: targetHost,
    proxystatus: undefined,
    status,
    errcode: code || "unknown",
  })
  log.log(
    level,
    "[Proxy] Error occurred while proxying request %s to %s [%s]",
    `${req?.headers.host ?? ""}${req?.url?.split("?")[0] ?? ""}`,
    targetHost,
    code || err,
  )

  if (res instanceof ServerResponse) {
    if (!res.headersSent) {
      res.statusCode = 502
      res.end("Bad Gateway")
    } else {
      res.destroy()
    }
  } else if (res && !res.destroyed) {
    res.end("HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n")
  }
})

proxyServer.on("proxyRes", (proxyRes, req, res) => {
  const requestPath = req.url?.split("?")[0] ?? ""
  const upstreamHost = proxyTargets.get(req)
  proxyEventsCounter.inc({
    target: upstreamHost,
    proxystatus: proxyRes.statusCode,
    status: res.statusCode,
    errcode: undefined,
  })
  log.info("[Proxy] %s %s -> %s [%s]", req.method, requestPath, upstreamHost ?? "", proxyRes.statusCode)
})

proxyServer.on("open", (socket) => {
  log.info("[Proxy] Client connected: %o", socket.address())
})

proxyServer.on("close", (_req, proxySocket) => {
  log.info("[Proxy] Client disconnected: %o", proxySocket.address())
})

let BUILD_PATH = path.join(process.cwd(), "../dist")

const indexHtml = Mustache.render(readFileSync(path.join(BUILD_PATH, "index.html")).toString(), {
  SETTINGS: `
    window.environment = {
        MILJO: '${MILJO}',
        NAIS_APP_IMAGE: '${NAIS_APP_IMAGE}',
        GIT_COMMIT: '${GIT_COMMIT}',
    }
  `,
})

const main = async () => {
  let appReady = false
  const app = express()
  app.disable("x-powered-by")
  app.set("views", BUILD_PATH)

  app.use(
    compression({
      level: 6,
      filter: (req, res) => {
        const contentType = (res.getHeader("Content-Type") as string) || ""

        if (contentType === "text/event-stream") {
          return false
        }

        // Compress all text files, JavaScript, CSS, and JSON
        return (
          /text|javascript|json|css|font|svg|xml/i.test(contentType) ||
          req.headers["accept-encoding"]?.includes("gzip") ||
          false
        )
      },
      threshold: 0,
    }),
  )

  app.use((_req, res, next) => {
    const originalSend = res.send
    // @ts-ignore - override send method to add custom header
    res.send = function (body) {
      // Add a custom header to indicate if compression is enabled
      res.setHeader("X-Compression-Enabled", "true")
      return originalSend.call(this, body)
    }
    next()
  })

  app.use("/{*splat}", (_req, res, next) => {
    res.setHeader("NAIS_APP_IMAGE", NAIS_APP_IMAGE)
    res.setHeader("VERSION", GIT_COMMIT)
    next()
  })

  app.use(
    apiMetricsMiddleware({
      metricsPath: "/internal/metrics",
    }),
  )

  /// Get info about the user based on the token
  app.get("/bff/userinfo", (req, res) => {
    if (MILJO === "local") {
      res.status(204).send()
      return
    }

    const token = oasis.getToken(req)
    if (!token) {
      log.warn("No token found")
      res.status(401).send({ message: "No token found" })
      return
    }

    const result = oasis.parseAzureUserToken(token)
    if (!result.ok) {
      log.error("Unable to parse user token")
      res.status(500).send({ message: "Unable to parse user token" })
      return
    }

    if (!result.name || !result.name.includes(", ")) {
      log.error("Invalid name in supplied token")
      res.status(500).send({ message: "Invalid name in supplied token" })
      return
    }

    const [lastName, firstName] = result.name.split(", ")
    res.status(200).send({
      fullnameInverted: result.name,
      fullname: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: result.preferred_username,
    })
  })

  app.get("/bff/version", (_req, res) => {
    res.status(200).send({ version: GIT_COMMIT })
  })

  const jsonParser = bodyParser.json()

  type LogLevel = "error" | "warn" | "info"
  const loggers: { [L in LogLevel]: LeveledLogMethod } = {
    error: log.error,
    warn: log.warn,
    info: log.info,
  }

  app.post("/bff/log", jsonParser, (req, res) => {
    const { level, message } = req.body as { level: LogLevel; message: string }
    try {
      const logger = loggers[level]
      logger(message)
      res.status(204).send()
    } catch (e) {
      log.warn("Invalid log level supplied")
      res.status(400).send({ message: "Invalid log level" })
    }
  })

  const apiTarget = {
    dev: "http://nks-bob-api",
    prod: "http://nks-bob-api",
    local: "http://localhost:8080",
    localnais: "http://localhost:8989",
  }[MILJO]!

  const proxyOptions = {
    secure: true,
    xfwd: true,
    changeOrigin: true,
  }

  const proxyHttpRequest = (req: IncomingMessage, res: ServerResponse, target: string) => {
    proxyTargets.set(req, new URL(target).host)
    void proxyServer
      .web(req, res, {
        ...proxyOptions,
        target,
      })
      .catch((error: unknown) => {
        log.error("[Proxy] HTTP proxy failed", error)
        if (!res.headersSent) {
          res.statusCode = 502
          res.end("Bad Gateway")
        } else {
          res.destroy()
        }
      })
  }

  app.use("/bob-api", entraMiddleware({ log, audience }), (req, res) => {
    proxyHttpRequest(req, res, apiTarget)
  })

  app.use("/bob-api-ws", (req, res) => {
    proxyHttpRequest(req, res, apiTarget)
  })

  /**
   * Dersom man ikke har gyldig sesjon redirecter vi til login-proxy aka. wonderwall
   * brukeren vil bli sendt tilbake til referer (siden hen stod på) etter innlogging
   *
   * https://doc.nais.io/auth/explanations/?h=wonder#login-proxy
   */
  app.get("/login", (req, res) => {
    const target = new URL(LOGIN_URL)
    const referer = (req.query.referer as string | undefined) ?? "/"
    log.info(`redirecting to login with referer ${referer}`)

    target.searchParams.set("redirect", referer)
    res.setHeader("Referer", referer)

    res.redirect(target.href)
  })

  app.use((req, res, next) => {
    if (MILJO !== "localnais") {
      next()
      return
    }

    // redirect back to vite served frontend
    const redirects = req.headersDistinct["referer"] ?? [undefined]
    const redirect = redirects[0]
    if (!redirect) {
      next()
      return
    }

    res.redirect(`${redirect.replace(/\/$/, "")}${req.originalUrl}`)
  })

  app.use(
    "/",
    express.static(BUILD_PATH, {
      index: false,
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Apply different cache strategies based on file type
        if (path.endsWith(".html")) {
          // HTML files - no caching
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf|eot)$/)) {
          // Assets with hash in filename - cache for 1 year
          if (path.match(/[a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
          } else {
            // Assets without hash - cache for 1 day
            res.setHeader("Cache-Control", "public, max-age=86400")
          }
        } else {
          // Default - moderate caching
          res.setHeader("Cache-Control", "public, max-age=3600")
        }
      },
    }),
  )

  app.get("/internal/isAlive", (_req, res) => {
    res.sendStatus(200)
    return
  })

  app.get("/internal/isReady", (_req, res) => {
    res.sendStatus(appReady ? 200 : 500)
    return
  })

  app.get("/{*splat}", (_req, res) => {
    res.setHeader("Cache-Control", "no-store")
    res.setHeader("Etag", GIT_COMMIT)
    res.send(indexHtml)
  })

  const server = app.listen(PORT, () => {
    log.info(`Server listening on port ${PORT}`)
    setTimeout(() => {
      appReady = true
      log.info("Server is ready")
    }, 5_000)
  })

  server.on("upgrade", async (req, socket, head) => {
    const wsPath = "/bob-api-ws"
    const requestUrl = req.url ?? "/"
    const queryStart = requestUrl.indexOf("?")
    const pathname = queryStart < 0 ? requestUrl : requestUrl.slice(0, queryStart)
    if (pathname !== wsPath && !pathname.startsWith(`${wsPath}/`)) {
      socket.destroy()
      return
    }

    const rewrittenPath = pathname.slice(wsPath.length) || "/"
    req.url = `${rewrittenPath}${queryStart < 0 ? "" : requestUrl.slice(queryStart)}`

    log.info("[Proxy] Upgrading WebSocket connection")
    proxyTargets.set(req, new URL(apiTarget).host)

    const result = await getToken(log, req, audience)
    if (result.ok) {
      req.headers.authorization = `Bearer ${result.data}`
    }

    return proxyServer.ws(
      req,
      socket as Socket,
      {
        ...proxyOptions,
        target: apiTarget.replace(/^http/, "ws"),
      },
      head,
    )
  })

  const terminator = createHttpTerminator({
    server,
    gracefulTerminationTimeout: 30_000, // defaults: terminator=5s, k8s=30s
  })

  process.on("SIGTERM", () => {
    log.info("SIGTERM signal received: closing HTTP server")
    terminator.terminate()
  })
}

main()
  .then((_) => log.info("main started"))
  .catch((e) => log.error("main failed", e))
