import express from "express"
import { Agent, createServer, request, type Server } from "node:http"
import { connect } from "node:net"
import { mkdtempSync, rmdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { WebSocket, WebSocketServer } from "ws"
import { createServer as createViteServer, type ViteDevServer } from "vite"
import {
  authenticatedWebSocketUpgrade,
  notificationPath,
  notificationSessionHandler,
  notificationsEnabled,
} from "./notificationSession.js"
import { result, TokenResult } from "./utils.js"
import { createWebSocketProxy } from "./websocketProxy.js"

const servers: Server[] = []
const sockets: WebSocket[] = []
const upstreams: WebSocketServer[] = []
const directories: string[] = []
const viteServers: ViteDevServer[] = []

async function listen(server: Server) {
  servers.push(server)
  const directory = mkdtempSync(join(tmpdir(), "bob-ws-"))
  directories.push(directory)
  const socketPath = `${directory}/server.sock`
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(socketPath, resolve)
  })
  return socketPath
}

async function sessionRequest(socketPath: string, init?: { headers: { authorization: string } }) {
  return new Promise<Response>((resolve, reject) => {
    const req = request({ socketPath, path: "/bff/session", headers: init?.headers }, (res) => {
      const chunks: Buffer[] = []
      res.on("data", (chunk: Buffer) => chunks.push(chunk))
      res.on("end", () =>
        resolve(
          new Response(Buffer.concat(chunks).toString(), {
            status: res.statusCode,
            headers: { "cache-control": res.headers["cache-control"] ?? "" },
          }),
        ),
      )
    })
    req.on("error", reject)
    req.end()
  })
}
afterEach(async () => {
  vi.unstubAllEnvs()
  sockets.forEach((s) => s.terminate())
  upstreams.forEach((s) => {
    s.clients.forEach((c) => c.terminate())
    s.close()
  })
  await Promise.all(viteServers.splice(0).map((server) => server.close()))
  await Promise.all(
    servers.map(
      (s) =>
        new Promise<void>((resolve) => {
          s.closeAllConnections()
          s.close(() => resolve())
        }),
    ),
  )
  servers.length = 0
  sockets.length = 0
  upstreams.length = 0
  directories.splice(0).forEach((directory) => rmdirSync(directory))
})

const token = (subject = "synthetic-oid", exp = Math.floor(Date.now() / 1000) + 3600) =>
  `test.${Buffer.from(JSON.stringify({ oid: subject, tid: "synthetic-tenant", exp })).toString("base64url")}.test`

async function sessionServer(
  options: { enabled?: boolean; local?: boolean; exchangeError?: boolean; oboToken?: string } = {},
) {
  const warn = vi.fn()
  const exchange = vi.fn(async (): Promise<TokenResult> =>
    options.exchangeError ? result.error("private upstream error") : result.ok(options.oboToken ?? token()),
  )
  const app = express()
  app.get(
    "/bff/session",
    notificationSessionHandler({
      token: exchange,
      local: options.local ?? false,
      enabled: () => options.enabled ?? true,
      warn,
    }),
  )
  const url = await listen(createServer(app))
  return { url, warn, exchange }
}

describe("notification session endpoint", () => {
  it("only enables subscriptions for the explicit true runtime flag", () => {
    vi.stubEnv("CONVERSATION_NOTIFICATIONS_ENABLED", undefined)
    expect(notificationsEnabled()).toBe(false)
    vi.stubEnv("CONVERSATION_NOTIFICATIONS_ENABLED", "false")
    expect(notificationsEnabled()).toBe(false)
    vi.stubEnv("CONVERSATION_NOTIFICATIONS_ENABLED", "true")
    expect(notificationsEnabled()).toBe(true)
  })
  it("defaults to disabled metadata without requesting tokens", async () => {
    const { url, exchange } = await sessionServer({ enabled: false })
    const response = await sessionRequest(url)
    expect(await response.json()).toEqual({ conversationNotificationsEnabled: false })
    expect(response.headers.get("cache-control")).toBe("no-store")
    expect(exchange).not.toHaveBeenCalled()
  })
  it("rejects missing and expired authentication", async () => {
    const { url, exchange } = await sessionServer()
    expect((await sessionRequest(url)).status).toBe(401)
    expect((await sessionRequest(url, { headers: { authorization: "Bearer malformed" } })).status).toBe(401)
    expect((await sessionRequest(url, { headers: { authorization: `Bearer ${token("synthetic", 1)}` } })).status).toBe(
      401,
    )
    expect(exchange).not.toHaveBeenCalled()
  })
  it("returns stable opaque metadata, never tokens or identifiable claims", async () => {
    const { url } = await sessionServer()
    const response = await sessionRequest(url, { headers: { authorization: `Bearer ${token()}` } })
    const data = await response.json()
    expect(data).toMatchObject({
      conversationNotificationsEnabled: true,
      expiresAt: expect.any(Number),
      userKey: expect.stringMatching(/^[0-9a-f]{64}$/),
      credentialVersion: expect.stringMatching(/^[0-9a-f]{64}$/),
    })
    expect(JSON.stringify(data)).not.toContain("synthetic-oid")
    expect(JSON.stringify(data)).not.toContain(token())
    const renewed = await sessionRequest(url, {
      headers: { authorization: `Bearer ${token("synthetic-oid", Math.floor(Date.now() / 1000) + 7200)}` },
    })
    expect((await renewed.json()).userKey).toBe(data.userKey)
  })
  it("reports technical exchange failure as 503 without leaking upstream error", async () => {
    const { url, warn } = await sessionServer({ exchangeError: true })
    const response = await sessionRequest(url, { headers: { authorization: `Bearer ${token()}` } })
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain("private upstream")
    expect(warn).toHaveBeenCalledExactlyOnceWith("notification-session:token-exchange-unavailable")
  })
  it("uses a stable opaque local identity for NAVident-only mock tokens", async () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600
    const localToken = (NAVident: string, exp: number) =>
      `test.${Buffer.from(JSON.stringify({ NAVident, exp })).toString("base64url")}.test`
    const { url, exchange, warn } = await sessionServer({
      local: true,
      oboToken: localToken("Z000001", expiresAt),
    })

    const response = await sessionRequest(url)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      conversationNotificationsEnabled: true,
      userKey: expect.stringMatching(/^[0-9a-f]{64}$/),
      credentialVersion: expect.stringMatching(/^[0-9a-f]{64}$/),
      expiresAt: expiresAt * 1000,
    })
    expect(JSON.stringify(data)).not.toContain("Z000001")
    expect(JSON.stringify(data)).not.toContain(localToken("Z000001", expiresAt))
    expect(response.headers.get("cache-control")).toBe("no-store")

    exchange.mockResolvedValueOnce(result.ok(localToken("Z000001", expiresAt + 3600)))
    const renewed = await (await sessionRequest(url)).json()
    expect(renewed.userKey).toBe(data.userKey)
    expect(renewed.credentialVersion).not.toBe(data.credentialVersion)

    exchange.mockResolvedValueOnce(result.ok(localToken("Z000002", expiresAt)))
    const otherUser = await (await sessionRequest(url)).json()
    expect(otherUser.userKey).not.toBe(data.userKey)
    expect(warn).not.toHaveBeenCalled()
  })
  it.each([
    { exp: Math.floor(Date.now() / 1000) + 3600 },
    { NAVident: "", exp: Math.floor(Date.now() / 1000) + 3600 },
    { NAVident: " ", exp: Math.floor(Date.now() / 1000) + 3600 },
    { NAVident: "Z000001", exp: 1 },
    { NAVident: "Z000001" },
  ])("rejects unusable local mock token metadata: %j", async (claims) => {
    const { url, warn } = await sessionServer({
      local: true,
      oboToken: `test.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.test`,
    })
    const response = await sessionRequest(url)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain("Z000001")
    expect(warn).toHaveBeenCalledTimes(1)
  })
  it("does not use local NAVident identity outside local mode", async () => {
    const subject = `test.${Buffer.from(
      JSON.stringify({ NAVident: "Z000001", exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url")}.test`
    const { url, warn } = await sessionServer()
    const response = await sessionRequest(url, { headers: { authorization: `Bearer ${subject}` } })
    expect(response.status).toBe(503)
    expect(warn).toHaveBeenCalledExactlyOnceWith("notification-session:invalid-token-metadata")
  })
})

describe("real authenticated WebSocket upgrade", () => {
  it.each([401, 403, 404])("reports upstream HTTP %i rejection without logging sensitive response data", async (status) => {
    const upstream = createServer((_req, res) => {
      res.writeHead(status)
      res.end("synthetic-private-upstream-detail")
    })
    const upstreamUrl = await listen(upstream)
    const agent = new Agent()
    agent.createConnection = () => connect(upstreamUrl)
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const proxy = createWebSocketProxy("ws://localhost", { agent, logger })
    const server = createServer()
    server.on(
      "upgrade",
      authenticatedWebSocketUpgrade({
        enabled: () => true,
        token: async () => result.ok("synthetic-obo"),
        warn: vi.fn(),
        upgrade: (req, socket, head) => proxy.upgrade(req, socket, head),
      }),
    )
    const url = await listen(server)
    const socket = new WebSocket(`ws+unix://${url}:${notificationPath}`)
    sockets.push(socket)
    const responseStatus = await new Promise<number | undefined>((resolve, reject) => {
      socket.once("unexpected-response", (_request, response) => {
        response.resume()
        socket.terminate()
        resolve(response.statusCode)
      })
      socket.once("error", reject)
    })
    expect(responseStatus).toBe(status)
    expect(logger.warn).toHaveBeenCalledExactlyOnceWith(`websocket:upstream-upgrade-rejected status=${status}`)
  })
  it("streams simultaneous message and notification events through Vite and the authenticated BFF", async () => {
    const messagePath = "/bob-api-ws/api/v2/conversations/00000000-0000-0000-0000-000000000001/messages/ws"
    const upstream = createServer()
    const wsServer = new WebSocketServer({ server: upstream })
    upstreams.push(wsServer)
    const upstreamUrl = await listen(upstream)
    const upstreamConnections = new Map<string, WebSocket>()
    wsServer.on("connection", (socket, req) => {
      upstreamConnections.set(req.url ?? "", socket)
    })
    const upstreamAgent = new Agent()
    upstreamAgent.createConnection = () => connect(upstreamUrl)
    const proxy = createWebSocketProxy("ws://localhost", { agent: upstreamAgent, changeOrigin: true, xfwd: true })
    const bff = createServer()
    const exchange = vi.fn(async (): Promise<TokenResult> => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return result.ok("synthetic-obo")
    })
    bff.on(
      "upgrade",
      authenticatedWebSocketUpgrade({
        enabled: () => true,
        token: exchange,
        warn: vi.fn(),
        upgrade: (req, socket, head) => proxy.upgrade(req, socket, head),
      }),
    )
    const bffUrl = await listen(bff)
    const bffAgent = new Agent()
    bffAgent.createConnection = () => connect(bffUrl)
    const browserProxy = createServer()
    const vite = await createViteServer({
      configFile: false,
      appType: "custom",
      optimizeDeps: { noDiscovery: true, include: [] },
      server: {
        middlewareMode: { server: browserProxy },
        hmr: false,
        watch: null,
        proxy: {
          "/bob-api": { target: "http://localhost", agent: bffAgent, changeOrigin: true },
          "/bob-api-ws": { target: "ws://localhost", agent: bffAgent, ws: true },
        },
      },
    })
    viteServers.push(vite)
    browserProxy.on("request", vite.middlewares)
    const browserUrl = await listen(browserProxy)
    const clients = [messagePath, notificationPath].map((path) => {
      const socket = new WebSocket(`ws+unix://${browserUrl}:${path}`, {
        headers: { Origin: "http://localhost:5173" },
      })
      sockets.push(socket)
      return socket
    })
    await Promise.all(
      clients.map(
        (socket) =>
          new Promise<void>((resolve, reject) => {
            socket.once("open", resolve)
            socket.once("error", reject)
          }),
      ),
    )
    expect(exchange).toHaveBeenCalledTimes(2)
    const events = [
      { type: "ContentUpdated", id: "synthetic-message", content: "Synthetic answer" },
      { type: "ConversationCreated", conversationId: "00000000-0000-0000-0000-000000000002" },
    ]
    for (const [index, path] of [messagePath, notificationPath].entries()) {
      const backendSocket = upstreamConnections.get(path.replace(/^\/bob-api-ws/, ""))
      if (!backendSocket) throw new Error("Missing upstream WebSocket connection")
      const event = new Promise<string>((resolve, reject) => {
        clients[index].once("message", (data) => resolve(data.toString()))
        clients[index].once("error", reject)
      })
      backendSocket.send(JSON.stringify(events[index]))
      expect(JSON.parse(await event)).toEqual(events[index])
      const pong = new Promise<Buffer>((resolve) => backendSocket.once("pong", resolve))
      backendSocket.ping("synthetic-heartbeat")
      expect((await pong).toString()).toBe("synthetic-heartbeat")
    }
  })
  it.each([
    [notificationPath, true],
    ["/bob-api-ws/api/v2/conversations/00000000-0000-0000-0000-000000000001/messages/ws", false],
  ] as const)("preserves authenticated transport for %s (notifications enabled: %s)", async (path, enabled) => {
    const upstream = createServer()
    const wsServer = new WebSocketServer({ server: upstream })
    upstreams.push(wsServer)
    const upstreamUrl = await listen(upstream)
    const received = new Promise<{ url?: string; origin?: string; authorization?: string; cookie?: string }>(
      (resolve) => {
        wsServer.on("connection", (socket, req) => {
          resolve({
            url: req.url,
            origin: req.headers.origin,
            authorization: req.headers.authorization,
            cookie: req.headers.cookie,
          })
          socket.send('{"type":"ConversationCreated"}')
        })
      },
    )
    const agent = new Agent()
    agent.createConnection = () => connect(upstreamUrl)
    const metrics = { forwarded: vi.fn(), connected: vi.fn(), disconnected: vi.fn() }
    const proxy = createWebSocketProxy("http://localhost", { changeOrigin: true, secure: true, agent }, metrics)
    const app = express()
    app.use("/bob-api-ws", proxy)
    const server = createServer(app)
    server.on(
      "upgrade",
      authenticatedWebSocketUpgrade({
        enabled: () => enabled,
        token: async () => result.ok("synthetic-obo"),
        warn: vi.fn(),
        upgrade: (req, socket, head) => proxy.upgrade(req, socket, head),
      }),
    )
    const url = await listen(server)
    const socket = new WebSocket(`ws+unix://${url}:${path}`, {
      headers: { Origin: "https://bob.ansatt.dev.nav.no", cookie: "synthetic-browser-session=not-a-token" },
    })
    sockets.push(socket)
    const message = new Promise<string>((resolve, reject) => {
      socket.once("message", (data) => resolve(data.toString()))
      socket.once("error", reject)
    })
    await new Promise<void>((resolve, reject) => {
      socket.on("open", resolve)
      socket.on("error", reject)
    })
    expect(await received).toEqual({
      url: path.replace("/bob-api-ws", ""),
      origin: "https://bob.ansatt.dev.nav.no",
      authorization: "Bearer synthetic-obo",
      cookie: undefined,
    })
    expect(metrics.forwarded).toHaveBeenCalledTimes(enabled ? 1 : 0)
    expect(metrics.connected).toHaveBeenCalledTimes(enabled ? 1 : 0)
    expect(await message).toBe('{"type":"ConversationCreated"}')
  })
  it.each([
    [notificationPath, false, 503],
    [`${notificationPath}/`, false, 404],
    ["/bob-api-ws/not-a-route", true, 404],
  ] as const)("does not allow gated or unexpected upgrades: %s", async (path, enabled, expected) => {
    const exchange = vi.fn(async (): Promise<TokenResult> => result.ok("synthetic-obo"))
    const server = createServer()
    server.on(
      "upgrade",
      authenticatedWebSocketUpgrade({
        enabled: () => enabled,
        token: exchange,
        warn: vi.fn(),
        upgrade: vi.fn(),
      }),
    )
    const url = await listen(server)
    const socket = new WebSocket(`ws+unix://${url}:${path}`)
    sockets.push(socket)
    const status = await new Promise<number | undefined>((resolve, reject) => {
      socket.on("unexpected-response", (_request, response) => {
        response.resume()
        socket.terminate()
        resolve(response.statusCode)
      })
      socket.on("error", reject)
    })
    expect(status).toBe(expected)
    expect(exchange).not.toHaveBeenCalled()
  })
})
