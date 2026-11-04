import { NotificationSession, SessionError } from "./session"

export type ConversationNotice = { conversationId: string; receivedAt: number }
export type NotificationStatus = "disabled" | "connecting" | "connected" | "disconnected" | "login-required" | "blocked"
export type NotificationSnapshot = {
  status: NotificationStatus
  notices: readonly ConversationNotice[]
  latest: ConversationNotice | null
  truncated: boolean
}
export type NotificationDiagnostic =
  "invalid-event" | "session-unavailable" | "connection-lost" | "policy-rejected" | "history-unavailable"

export function parseConversationNotification(payload: unknown): string | null {
  if (typeof payload !== "string") throw new Error("Invalid notification frame")
  const value: unknown = JSON.parse(payload)
  if (typeof value !== "object" || value === null || !("type" in value)) {
    throw new Error("Invalid notification object")
  }
  if (value.type !== "ConversationCreated") return null
  if (
    !("conversationId" in value) ||
    typeof value.conversationId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.conversationId)
  )
    throw new Error("Invalid notification identifier")
  return value.conversationId.toLowerCase()
}

export function notificationRetryDelay(attempt: number, random = Math.random()): number {
  const cap = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5))
  return 1000 + Math.max(0, Math.min(1, random)) * (cap - 1000)
}

export type NotificationSocket = {
  onopen: ((event: Event) => void) | null
  onmessage: ((event: MessageEvent) => void) | null
  onclose: ((event: CloseEvent) => void) | null
  onerror: ((event: Event) => void) | null
  close: () => void
}

type Dependencies = {
  session: (signal: AbortSignal) => Promise<NotificationSession>
  socket: () => NotificationSocket
  refreshHistory: (signal: AbortSignal) => Promise<void>
  report: (category: NotificationDiagnostic) => void
  online: () => boolean
}

const initialSnapshot = (): NotificationSnapshot => ({
  status: "disabled",
  notices: [],
  latest: null,
  truncated: false,
})

export class ConversationNotifications {
  private snapshot = initialSnapshot()
  private listeners = new Set<() => void>()
  private seen = new Set<string>()
  private socket?: NotificationSocket
  private timer?: ReturnType<typeof setTimeout>
  private stableTimer?: ReturnType<typeof setTimeout>
  private expiryTimer?: ReturnType<typeof setTimeout>
  private connectionExpiresAt?: number
  private active = false
  private epoch = 0
  private attempt = 0
  private currentSession?: NotificationSession
  private request?: Promise<void>
  private requestAbort?: AbortController
  private userAbort = new AbortController()
  private policySession?: NotificationSession
  private renewedAfterPolicy = false
  private opened = false
  private reports = new Set<NotificationDiagnostic>()

  constructor(private readonly dependencies: Dependencies) {}

  getSnapshot = () => this.snapshot
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  private update(patch: Partial<NotificationSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach((listener) => listener())
  }
  private report(category: NotificationDiagnostic) {
    if (this.reports.has(category)) return
    this.reports.add(category)
    this.dependencies.report(category)
  }
  start = () => {
    if (this.active) return
    this.active = true
    this.userAbort = new AbortController()
    void this.checkSession()
  }
  stop = () => {
    this.active = false
    this.epoch++
    this.requestAbort?.abort()
    this.request = undefined
    this.userAbort.abort()
    this.closeSocket()
    clearTimeout(this.timer)
    this.currentSession = undefined
    this.seen.clear()
    this.reports.clear()
    this.attempt = 0
    this.opened = false
    this.policySession = undefined
    this.renewedAfterPolicy = false
    this.update(initialSnapshot())
  }
  dismiss = () => this.update({ latest: null })
  checkSession = (): Promise<void> => {
    if (!this.active) return Promise.resolve()
    if (this.request) return this.request
    clearTimeout(this.timer)
    if (!this.dependencies.online()) {
      this.closeSocket()
      this.update({ status: "disconnected" })
      return Promise.resolve()
    }
    const epoch = this.epoch
    const abort = new AbortController()
    this.requestAbort = abort
    const request = this.loadSession(epoch, abort.signal)
    this.request = request
    void request.finally(() => {
      if (this.request === request) this.request = undefined
    })
    return request
  }
  private async loadSession(epoch: number, signal: AbortSignal) {
    try {
      const session = await this.dependencies.session(signal)
      if (!this.active || epoch !== this.epoch || signal.aborted) return
      if (this.currentSession && this.currentSession.userKey !== session.userKey) {
        this.resetUser()
      }
      this.currentSession = session
      if (!session.conversationNotificationsEnabled) {
        this.closeSocket()
        this.update({ ...initialSnapshot(), status: "disabled" })
        return
      }
      if (session.expiresAt <= Date.now()) {
        this.resetUser()
        this.update({ status: "login-required" })
        return
      }
      if (this.policySession) {
        const renewed =
          this.policySession.userKey === session.userKey &&
          this.policySession.credentialVersion !== session.credentialVersion &&
          session.expiresAt > this.policySession.expiresAt
        if (!renewed || this.renewedAfterPolicy) {
          this.update({ status: "blocked" })
          return
        }
        this.renewedAfterPolicy = true
        this.policySession = undefined
      }
      if (!this.socket) this.connect()
      else if (this.connectionExpiresAt !== undefined) {
        this.scheduleExpiry(Math.min(this.connectionExpiresAt, session.expiresAt))
      }
    } catch (error) {
      if (!this.active || epoch !== this.epoch || signal.aborted) return
      this.closeSocket()
      if (error instanceof SessionError && error.status === 401) {
        this.resetUser()
        this.update({ status: "login-required" })
      } else {
        this.report("session-unavailable")
        this.retry()
      }
    }
  }
  private resetUser() {
    this.epoch++
    this.closeSocket()
    clearTimeout(this.timer)
    this.userAbort.abort()
    this.userAbort = new AbortController()
    this.seen.clear()
    this.reports.clear()
    this.currentSession = undefined
    this.policySession = undefined
    this.renewedAfterPolicy = false
    this.attempt = 0
    this.opened = false
    this.update(initialSnapshot())
  }
  private closeSocket() {
    clearTimeout(this.stableTimer)
    clearTimeout(this.expiryTimer)
    const socket = this.socket
    this.socket = undefined
    this.connectionExpiresAt = undefined
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      socket.close()
    }
  }
  private scheduleExpiry(expiresAt: number) {
    clearTimeout(this.expiryTimer)
    this.connectionExpiresAt = expiresAt
    this.expiryTimer = setTimeout(
      () => {
        this.closeSocket()
        void this.checkSession()
      },
      Math.min(2_147_483_647, Math.max(0, expiresAt - Date.now())),
    )
  }
  private retry() {
    this.update({ status: "disconnected" })
    if (!this.active || !this.dependencies.online()) return
    clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.checkSession(), notificationRetryDelay(this.attempt++))
  }
  private refreshHistory() {
    const signal = this.userAbort.signal
    void this.dependencies.refreshHistory(signal).catch(() => {
      if (!signal.aborted && this.active) this.report("history-unavailable")
    })
  }
  private connect() {
    const socketSession = this.currentSession
    if (!socketSession) return
    this.update({ status: "connecting" })
    const epoch = this.epoch
    let socket: NotificationSocket
    try {
      socket = this.dependencies.socket()
    } catch {
      this.report("connection-lost")
      this.retry()
      return
    }
    this.socket = socket
    this.scheduleExpiry(socketSession.expiresAt)
    const current = () => this.active && epoch === this.epoch && this.socket === socket
    socket.onopen = () => {
      if (!current()) return
      this.update({ status: "connected" })
      this.stableTimer = setTimeout(() => {
        this.attempt = 0
        this.renewedAfterPolicy = false
      }, 60_000)
      if (this.opened) this.refreshHistory()
      this.opened = true
    }
    socket.onmessage = (event) => {
      // Suppress events while checking whether the browser changed user.
      if (!current() || this.request) return
      let id: string | null
      try {
        id = parseConversationNotification(event.data)
      } catch {
        this.report("invalid-event")
        return
      }
      if (!id || this.seen.has(id)) return
      this.seen.add(id)
      if (this.seen.size > 1000) {
        const oldest = this.seen.values().next().value
        if (oldest) this.seen.delete(oldest)
      }
      const notice = { conversationId: id, receivedAt: Date.now() }
      this.update({
        notices: [notice, ...this.snapshot.notices].slice(0, 100),
        latest: notice,
        truncated: this.snapshot.truncated || this.snapshot.notices.length >= 100,
      })
      this.refreshHistory()
    }
    socket.onclose = (event) => {
      if (!current()) return
      this.closeSocket()
      if (event.code === 1008) {
        this.report("policy-rejected")
        this.policySession = socketSession
        this.update({ status: "blocked" })
        void this.checkSession()
      } else {
        this.report("connection-lost")
        this.retry()
      }
    }
    // The browser's close event carries the usable status; onerror has no HTTP response.
    socket.onerror = () => {
      if (current()) this.report("connection-lost")
    }
  }
}
