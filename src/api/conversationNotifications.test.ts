import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  ConversationNotifications,
  NotificationSocket,
  notificationRetryDelay,
  parseConversationNotification,
} from "./conversationNotifications"
import { NotificationSession, SessionError } from "./session"

const id = "00000000-0000-0000-0000-000000000001"
const event = (conversationId = id) => JSON.stringify({ type: "ConversationCreated", conversationId })

class TestSocket {
  onopen: NotificationSocket["onopen"] = null
  onclose: NotificationSocket["onclose"] = null
  onmessage: NotificationSocket["onmessage"] = null
  onerror: NotificationSocket["onerror"] = null
  close = vi.fn()
  send = vi.fn()
  open() {
    this.onopen?.call(this.webSocket(), new Event("open"))
  }
  message(data: unknown = event()) {
    this.onmessage?.call(this.webSocket(), new MessageEvent("message", { data }))
  }
  disconnect(code = 1006) {
    this.onclose?.call(this.webSocket(), new CloseEvent("close", { code }))
  }
  webSocket(): NotificationSocket {
    return this
  }
}

function fixture() {
  const sockets: TestSocket[] = []
  const data: NotificationSession = {
    userKey: "synthetic-a",
    credentialVersion: "v1",
    expiresAt: Date.now() + 3_600_000,
    conversationNotificationsEnabled: true,
  }
  const session = vi.fn(async () => data)
  const refreshHistory = vi.fn(async (_signal: AbortSignal) => {})
  const report = vi.fn()
  const online = vi.fn(() => true)
  const controller = new ConversationNotifications({
    session,
    refreshHistory,
    report,
    online,
    socket: () => {
      const socket = new TestSocket()
      sockets.push(socket)
      return socket.webSocket()
    },
  })
  return { controller, sockets, session, data, refreshHistory, report, online }
}

describe("notification payload", () => {
  it("accepts UUIDs case-insensitively and ignores unknown events", () => {
    expect(parseConversationNotification(event())).toBe(id)
    expect(parseConversationNotification(event("AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"))).toBe(
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    )
    expect(parseConversationNotification('{"type":"FutureEvent"}')).toBeNull()
  })
  it.each(["{", "null", "[]", "{}", event("https://example.com"), event("../samtaler"), new Blob()])(
    "rejects malformed or unsafe frames without a link",
    (value) => {
      expect(() => parseConversationNotification(value)).toThrow()
    },
  )
})

describe("notification lifecycle", () => {
  let f: ReturnType<typeof fixture>
  beforeEach(async () => {
    vi.useFakeTimers()
    f = fixture()
    f.controller.start()
    await f.controller.checkSession()
    f.sockets[0].open()
  })
  afterEach(() => {
    f.controller.stop()
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })

  it("deduplicates across reconnect and synchronizes history once on reconnect", async () => {
    f.sockets[0].message()
    f.sockets[0].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
    expect(f.refreshHistory).toHaveBeenCalledTimes(1)
    f.sockets[0].disconnect(1013)
    await vi.advanceTimersByTimeAsync(1000)
    expect(f.sockets).toHaveLength(2)
    f.sockets[1].open()
    f.sockets[1].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
    expect(f.refreshHistory).toHaveBeenCalledTimes(2)
    expect(f.sockets.every((s) => s.send.mock.calls.length === 0)).toBe(true)
  })

  it("keeps notices after banner dismissal and caps both memory buffers", () => {
    for (let n = 1; n <= 1001; n++) {
      f.sockets[0].message(event(`00000000-0000-0000-0000-${String(n).padStart(12, "0")}`))
    }
    expect(f.controller.getSnapshot().notices).toHaveLength(100)
    expect(f.controller.getSnapshot().truncated).toBe(true)
    f.controller.dismiss()
    expect(f.controller.getSnapshot().latest).toBeNull()
    f.sockets[0].message()
    expect(f.controller.getSnapshot().latest?.conversationId).toBe(id)
  })

  it("removes only the opened conversation without forgetting deduplication", () => {
    const otherId = "00000000-0000-0000-0000-000000000002"
    f.sockets[0].message()
    f.sockets[0].message(event(otherId))
    f.controller.removeNotice(id)
    expect(f.controller.getSnapshot().notices.map((notice) => notice.conversationId)).toEqual([otherId])
    expect(f.controller.getSnapshot().latest?.conversationId).toBe(otherId)
    f.controller.removeNotice(otherId)
    expect(f.controller.getSnapshot().latest).toBeNull()
    expect(f.controller.getSnapshot().notices).toEqual([])
    f.sockets[0].message()
    f.sockets[0].message(event(otherId))
    expect(f.controller.getSnapshot().notices).toEqual([])
    expect(f.refreshHistory).toHaveBeenCalledTimes(2)
  })

  it("rejects malformed frames once without crashing subsequent messages", () => {
    f.sockets[0].message("{")
    f.sockets[0].message(event("bad-id"))
    f.sockets[0].message('{"type":"FutureEvent"}')
    f.sockets[0].message()
    expect(f.report).toHaveBeenCalledExactlyOnceWith("invalid-event")
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
  })

  it("uses bounded jitter without resetting backoff on short connections", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(1)
    f.sockets[0].disconnect(1011)
    await vi.advanceTimersByTimeAsync(1000)
    f.sockets[1].open()
    f.sockets[1].disconnect()
    await vi.advanceTimersByTimeAsync(1999)
    expect(f.sockets).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1)
    f.sockets[2].open()
    await vi.advanceTimersByTimeAsync(60_000)
    f.sockets[2].disconnect()
    await vi.advanceTimersByTimeAsync(1000)
    expect(f.sockets).toHaveLength(4)
    expect(notificationRetryDelay(100, 1)).toBe(30_000)
    expect(notificationRetryDelay(100, 0)).toBe(1000)
    random.mockRestore()
  })

  it("stops a policy loop and only retries with confirmed renewed credentials", async () => {
    f.sockets[0].disconnect(1008)
    await f.controller.checkSession()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(f.sockets).toHaveLength(1)
    expect(f.controller.getSnapshot().status).toBe("blocked")
    f.session.mockResolvedValue({ ...f.data, credentialVersion: "v2", expiresAt: f.data.expiresAt + 60_000 })
    await f.controller.checkSession()
    expect(f.sockets).toHaveLength(2)
    f.sockets[1].disconnect(1008)
    f.session.mockResolvedValue({ ...f.data, credentialVersion: "v3", expiresAt: f.data.expiresAt + 120_000 })
    await f.controller.checkSession()
    expect(f.sockets).toHaveLength(2)
  })

  it("cleans up on logout and ignores captured callbacks from the old session", async () => {
    f.sockets[0].message()
    const historySignal = f.refreshHistory.mock.calls[0][0]
    const oldMessage = f.sockets[0].onmessage
    f.session.mockRejectedValue(new SessionError(401))
    await f.controller.checkSession()
    oldMessage?.call(f.sockets[0].webSocket(), new MessageEvent("message", { data: event() }))
    expect(f.controller.getSnapshot().notices).toEqual([])
    expect(f.controller.getSnapshot().status).toBe("login-required")
    expect(f.sockets[0].close).toHaveBeenCalledOnce()
    expect(historySignal.aborted).toBe(true)
  })

  it("ignores an old session response after cleanup and restart", async () => {
    let resolve!: (session: NotificationSession) => void
    f.session.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const oldRequest = f.controller.checkSession()
    f.controller.stop()
    f.controller.start()
    await f.controller.checkSession()
    resolve({ ...f.data, userKey: "outdated-user" })
    await oldRequest
    expect(f.sockets).toHaveLength(2)
    expect(f.controller.getSnapshot().status).toBe("connecting")
    f.sockets[1].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
  })

  it("compares policy rejection against the credentials observed when the socket opened", async () => {
    f.session.mockResolvedValue({
      ...f.data,
      credentialVersion: "v2",
      expiresAt: f.data.expiresAt + 60_000,
    })
    await f.controller.checkSession()
    f.sockets[0].disconnect(1008)
    await f.controller.checkSession()
    expect(f.sockets).toHaveLength(2)
  })

  it("does not extend an existing socket's authentication when HTTP metadata is renewed", async () => {
    await vi.advanceTimersByTimeAsync(3_599_000)
    f.session.mockResolvedValue({
      ...f.data,
      credentialVersion: "v2",
      expiresAt: f.data.expiresAt + 3_600_000,
    })
    await f.controller.checkSession()
    await vi.advanceTimersByTimeAsync(1000)
    expect(f.sockets[0].close).toHaveBeenCalledOnce()
    expect(f.sockets).toHaveLength(2)
  })

  it("changes user without retaining notices, dedupe or asynchronous callbacks", async () => {
    f.sockets[0].message()
    const oldMessage = f.sockets[0].onmessage
    f.session.mockResolvedValue({ ...f.data, userKey: "synthetic-b" })
    await f.controller.checkSession()
    expect(f.controller.getSnapshot().notices).toEqual([])
    oldMessage?.call(f.sockets[0].webSocket(), new MessageEvent("message", { data: event() }))
    expect(f.controller.getSnapshot().notices).toEqual([])
    f.sockets[1].open()
    f.sockets[1].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
  })

  it("does not accept messages while validating a possible user change", async () => {
    let resolve!: (session: NotificationSession) => void
    f.session.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const check = f.controller.checkSession()
    f.sockets[0].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(0)
    resolve(f.data)
    await check
    f.sockets[0].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
  })

  it("waits while offline, checks on resume and does not send periodic REST calls", async () => {
    f.online.mockReturnValue(false)
    await f.controller.checkSession()
    await vi.advanceTimersByTimeAsync(120_000)
    expect(f.session).toHaveBeenCalledTimes(1)
    expect(f.controller.getSnapshot().status).toBe("disconnected")
    f.online.mockReturnValue(true)
    await f.controller.checkSession()
    expect(f.sockets).toHaveLength(2)
  })

  it("survives Strict Mode cleanup/restart without old retries or callbacks", async () => {
    f.sockets[0].disconnect()
    f.controller.stop()
    f.controller.start()
    await f.controller.checkSession()
    await vi.advanceTimersByTimeAsync(30_000)
    expect(f.sockets).toHaveLength(2)
    f.sockets[1].message()
    expect(f.controller.getSnapshot().notices).toHaveLength(1)
  })

  it("disables listening when runtime configuration is turned off", async () => {
    f.sockets[0].message()
    f.session.mockResolvedValue({ ...f.data, conversationNotificationsEnabled: false })
    await f.controller.checkSession()
    expect(f.controller.getSnapshot().status).toBe("disabled")
    expect(f.controller.getSnapshot().notices).toHaveLength(0)
    expect(f.sockets[0].close).toHaveBeenCalledOnce()
  })

  it("checks authentication on expiry instead of reconnecting with expired metadata", async () => {
    f.session.mockResolvedValue({ ...f.data, expiresAt: Date.now() + 1000 })
    await f.controller.checkSession()
    await vi.advanceTimersByTimeAsync(1000)
    expect(f.controller.getSnapshot().status).toBe("login-required")
    expect(f.sockets).toHaveLength(1)
  })
})
