import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import express from "express"
import { CacheContainer } from "node-ts-cache"
import { MemoryStorage } from "node-ts-cache-storage-memory"
import { defineConfig, PluginOption, ProxyOptions, ViteDevServer } from "vite"
import { createProxyMiddleware } from "http-proxy-middleware"
import { IncomingMessage } from "http"

config()

const tokenCache = new CacheContainer(new MemoryStorage())

async function fetchToken() {
  const url = "https://fakedings.intern.dev.nav.no/fake/custom"
  const options = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      NAVident: process.env.VITE_NAVIDENT ?? "Z123456",
      aud: "nks-bob-api",
      azp: "consumer-client-id",
      sub: "31a9a29e-a7e9-4a4b-b823-8c39707e475e",
      scp: "User.Read",
      ver: "2.0",
      azpacr: "1",
      aio: "31dfd903-1d65-4512-9e8d-59acd70859ce",
      tid: "default",
    }),
  }

  const res = await fetch(url, options)
  const token = await res.text()
  return token
}

async function getToken() {
  const cachedToken = await tokenCache.getItem<string>("token")
  if (cachedToken) {
    return cachedToken
  }

  console.log("Token expired. Fetching new token.")
  const newToken = fetchToken()
  await tokenCache.setItem("token", newToken, { ttl: 55 })

  return newToken
}

const app = express()

const CALL_ID = "nav-call-id"

app.use(
  (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    const callId = req.headers[CALL_ID]
    if (!callId) {
      req.headers[CALL_ID] = "mock_call_id"
    }

    next()
  },
)

app.use(
  "/bob-api",
  async (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const token = await getToken()
    res.setHeader("Authorization", `Bearer ${token}`)
    next()
  },
)

const wsProxyMiddleware =
  createProxyMiddleware({
    pathFilter: "/bob-api-ws",
    pathRewrite: (path) => path.replace(/bob-api-ws/, ""),
    target: "ws://localhost:8080",
    on: {
      proxyReqWs: (proxyReq, _req, _socket, _head) => {
        proxyReq.appendHeader(CALL_ID, "mock_call_id")
      }
    }
  })

app.use(wsProxyMiddleware)

const proxy: Record<string, string | ProxyOptions> = {
  "/bob-api": {
    target: "http://localhost:8080",
    rewrite: (path) => path.replace(/bob-api/, ""),
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq, _req, res) => {
        const authHeader = res.getHeader("Authorization") as string
        proxyReq.setHeader("Authorization", authHeader)
      })
    },
  },
}

const authMiddlewarePlugin = (): PluginOption => ({
  name: "auth-middleware-plugin",
  configureServer: (server: ViteDevServer) => {
    server.middlewares.use(app)

    server.httpServer?.on('upgrade', async (
      req: IncomingMessage, socket: any, head: Buffer
    ) => {
      const token = await getToken()
      req.headers.authorization = `Bearer ${token}`
      return wsProxyMiddleware.upgrade(req, socket, head)
    }
    );
  },
  config: () => ({
    server: { proxy },
    preview: { proxy },
  }),
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), authMiddlewarePlugin()],
  define: {
    "process.env": process.env,
  },
  server: {
    port: 5173,
  },
  build: {
    sourcemap: true,
  },
})
