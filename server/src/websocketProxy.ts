import { createProxyMiddleware, type Options } from "http-proxy-middleware"

type NotificationMetrics = {
  forwarded: () => void
  connected: () => void
  disconnected: () => void
}

export function createWebSocketProxy(
  target: string,
  options: Partial<Options> = {},
  notifications?: NotificationMetrics,
) {
  return createProxyMiddleware({
    ...options,
    target,
    pathFilter: "/bob-api-ws",
    pathRewrite: (path) => path.replace(/^\/bob-api-ws/, ""),
    on: {
      proxyReqWs: (proxyReq, req) => {
        proxyReq.removeHeader("cookie")
        proxyReq.once("response", (response) => {
          options.logger?.warn(`websocket:upstream-upgrade-rejected status=${response.statusCode ?? "unknown"}`)
        })
        if (req.url === "/api/v2/conversations/notifications/ws") {
          notifications?.forwarded()
          proxyReq.once("upgrade", (_response, socket) => {
            notifications?.connected()
            socket.once("close", () => notifications?.disconnected())
          })
        }
      },
    },
  })
}
