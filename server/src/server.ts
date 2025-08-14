import compression from "compression"
import cors from "cors"
import { randomUUID } from "crypto"
import express from "express"
import { readFileSync } from "fs"
import { IncomingMessage, ServerResponse } from "http"
import httpProxyMiddleware, {
  debugProxyErrorsPlugin,
  errorResponsePlugin,
  proxyEventsPlugin,
} from "http-proxy-middleware"
import { Options, Plugin } from "http-proxy-middleware/dist/types.js"
import { createHttpTerminator } from "http-terminator"
import Mustache from "mustache"
import path from "path"
import Prometheus from "prom-client"
import { createLogger, format, LeveledLogMethod, transports } from "winston"
import { entraMiddleware, getToken } from "./entra.js"
import require from "./esm-require.js"

const apiMetricsMiddleware = require("prometheus-api-metrics")
const { createProxyMiddleware } = httpProxyMiddleware

const CALL_ID = "nav-call-id"

export const {
  PORT = 3030,
  NAIS_APP_IMAGE = "?",
  GIT_COMMIT = "?",
  LOGIN_URL = "",
  NAIS_CLUSTER_NAME = "local",
  MILJO = "local",
  NAIS_TOKEN_EXCHANGE_ENDPOINT = "",
  SALESFORCE_DOMAINS = "", // Comma-separated list of allowed Salesforce domains
} = process.env

const audience =
  {
    dev: "api://dev-gcp.nks-aiautomatisering.nks-bob-api/.default",
    prod: "api://prod-gcp.nks-aiautomatisering.nks-bob-api/.default",
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

type HpmPlugin = Plugin<IncomingMessage, ServerResponse<IncomingMessage>>

const cookieScraperPlugin: HpmPlugin = (proxyServer) => {
  proxyServer.on("proxyReq", (proxyReq, _req, _res) => {
    if (proxyReq.getHeader("cookie")) {
      proxyReq.removeHeader("cookie")
    }
  })
}

// copy with mods from http-proxy-middleware https://github.com/chimurai/http-proxy-middleware/blob/master/src/plugins/default/logger-plugin.ts
const loggerPlugin: HpmPlugin = (proxyServer) => {
  proxyServer.on("error", (err: any, req: any, res: any, target: any) => {
    const hostname = req?.headers?.host
    // target is undefined when websocket errors
    const errReference =
      "https://nodejs.org/api/errors.html#errors_common_system_errors" // link to Node Common Systems Errors page
    proxyEventsCounter.inc({
      target: target?.host,
      proxystatus: undefined,
      status: res.statusCode,
      errcode: err.code || "unknown",
    })
    const level =
      /HPE_INVALID/.test(err.code) ||
      ["ECONNRESET", "ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"].includes(
        err.code,
      )
        ? "warn"
        : "error"
    log.log(
      level,
      "[HPM] Error occurred while proxying request %s to %s [%s] (%s)",
      `${hostname}${req?.host}${req?.path}`,
      `${target?.href}`,
      err.code || err,
      errReference,
    )
  })

  proxyServer.on("proxyRes", (proxyRes: any, req: any, res) => {
    const originalUrl = req.originalUrl ?? `${req.baseUrl || ""}${req.url}`
    const pathUpToSearch = proxyRes.req.path.replace(/\?.*$/, "")
    const exchange = `[HPM] ${req.method} ${originalUrl} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${pathUpToSearch} [${proxyRes.statusCode}]`

    proxyEventsCounter.inc({
      target: proxyRes.req.host,
      proxystatus: proxyRes.statusCode,
      status: res.statusCode,
      errcode: undefined,
    })
    log.info(exchange)
  })

  proxyServer.on("open", (socket) => {
    log.info("[HPM] Client connected: %o", socket.address())
  })

  proxyServer.on("close", (_req, proxySocket) => {
    log.info("[HPM] Client disconnected: %o", proxySocket.address())
  })
}

const callIdPlugin: HpmPlugin = (proxyServer) => {
  proxyServer.on("proxyReq", (proxyReq, _req, _res) => {
    if (!proxyReq.hasHeader(CALL_ID)) {
      proxyReq.appendHeader(CALL_ID, randomUUID())
    }
  })

  proxyServer.on("proxyReqWs", (proxyReq, _req, _socket, _head) => {
    if (!proxyReq.hasHeader(CALL_ID)) {
      proxyReq.appendHeader(CALL_ID, randomUUID())
    }
  })
}

let BUILD_PATH = path.join(process.cwd(), "../dist")

const indexHtml = Mustache.render(
  readFileSync(path.join(BUILD_PATH, "index.html")).toString(),
  {
    SETTINGS: `
    window.environment = {
        MILJO: '${MILJO}',
        NAIS_APP_IMAGE: '${NAIS_APP_IMAGE}',
        GIT_COMMIT: '${GIT_COMMIT}',
    }
  `,
  },
)

const proxyOptions: Partial<Options> = {
  logger: log,
  secure: true,
  xfwd: true,
  changeOrigin: true,
  ejectPlugins: true,
  plugins: [
    cookieScraperPlugin,
    callIdPlugin,
    debugProxyErrorsPlugin,
    errorResponsePlugin,
    loggerPlugin,
    proxyEventsPlugin,
  ],
}

const main = async () => {
  let appReady = false
  const app = express()
  app.disable("x-powered-by")
  app.set("views", BUILD_PATH)

  // Configure CORS for Salesforce iframe support
  const allowedOrigins = SALESFORCE_DOMAINS
    ? SALESFORCE_DOMAINS.split(",").map((domain) => domain.trim())
    : []

  if (MILJO === "local") {
    allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173")
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true)

        // Allow if origin is in the allowed list or if no specific domains configured
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  )

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

  app.use((req, res, next) => {
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
    next()
  })

  app.use(
    apiMetricsMiddleware({
      metricsPath: "/internal/metrics",
    }),
  )

  app.use(
    "/bob-api",
    entraMiddleware({ log, audience }),
    createProxyMiddleware({
      ...proxyOptions,
      target: {
        dev: "http://nks-bob-api",
        prod: "http://nks-bob-api",
        local: "http://localhost:8080",
      }[MILJO]!,
      pathRewrite: (path: string) => path.replace(/bob-api/, ""),
      on: {
        proxyReq: (proxyReq, _req, res) => {
          const authHeader = res.getHeader("Authorization") as string
          proxyReq.setHeader("Authorization", authHeader)
          res.removeHeader("Authorization")
        },
      },
    }),
  )

  const wsMiddleware = createProxyMiddleware({
    ...proxyOptions,
    pathFilter: "/bob-api-ws",
    pathRewrite: (path) => path.replace(/bob-api-ws/, ""),
    target: {
      dev: "ws://nks-bob-api",
      prod: "ws://nks-bob-api",
      local: "ws://localhost:8080",
    }[MILJO]!,
  })

  app.use("/bob-api-ws", wsMiddleware)

  /**
   * Dersom man ikke har gyldig sesjon redirecter vi til login-proxy aka. wonderwall
   * brukeren vil bli sendt tilbake til referer (siden hen stod på) etter innlogging
   *
   * https://doc.nais.io/auth/explanations/?h=wonder#login-proxy
   */
  app.get("/login", (req, res) => {
    const target = new URL(LOGIN_URL)
    const referer = (req.query.referer as string | undefined) ?? "/"

    // For popup authentication, redirect to auth success page
    const isPopup = req.query.popup === "true"
    // const redirectUrl = isPopup ? "/auth/success" : referer
    const redirectUrl = "https://bob.ansatt.dev.nav.no/oauth2/callback"

    log.info(`redirecting to login with referer ${redirectUrl}`)

    target.searchParams.set("redirect", redirectUrl)
    res.setHeader("Referer", redirectUrl)

    res.redirect(target.href)
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
        } else if (
          path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf|eot)$/)
        ) {
          // Assets with hash in filename - cache for 1 year
          if (path.match(/[a-f0-9]{8,}\.(js|css|png|jpg|jpeg|gif|svg)$/)) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            )
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

  server.on("upgrade", async (req, socket: any, head) => {
    log.info("[HPM] Upgrading Websocket connection")

    const result = await getToken(log, req, audience)
    if (result.ok) {
      req.headers.authorization = `Bearer ${result.data}`
    }

    return wsMiddleware.upgrade(req, socket, head)
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
