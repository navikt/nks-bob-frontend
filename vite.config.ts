import react from "@vitejs/plugin-react"
import { config } from "dotenv"
import express from "express"
import memoize from "just-memoize"
import { defineConfig, PluginOption, ProxyOptions, ViteDevServer } from "vite"

config()

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

const getToken = memoize(fetchToken)

const app = express()

app.use("/bob-api", async (_req, res, next) => {
  const token = await getToken()
  res.setHeader("Authorization", `Bearer ${token}`)
  next()
})

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
