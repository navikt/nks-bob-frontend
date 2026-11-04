export type NotificationSession = {
  userKey: string
  expiresAt: number
  credentialVersion: string
  conversationNotificationsEnabled: boolean
}

export class SessionError extends Error {
  constructor(public readonly status: number) {
    super("Notification session unavailable")
  }
}

export async function fetchNotificationSession(signal: AbortSignal): Promise<NotificationSession> {
  const response = await fetch(`${import.meta.env.BASE_URL}bff/session`, {
    credentials: "include",
    cache: "no-store",
    signal,
    redirect: "error",
  })
  if (!response.ok) throw new SessionError(response.status)
  const data: unknown = await response.json()
  if (
    typeof data === "object" &&
    data !== null &&
    "conversationNotificationsEnabled" in data &&
    data.conversationNotificationsEnabled === false
  )
    return { userKey: "disabled", expiresAt: 0, credentialVersion: "disabled", conversationNotificationsEnabled: false }
  if (
    typeof data !== "object" ||
    data === null ||
    !("userKey" in data) ||
    typeof data.userKey !== "string" ||
    !data.userKey ||
    !("expiresAt" in data) ||
    typeof data.expiresAt !== "number" ||
    !Number.isFinite(data.expiresAt) ||
    !("credentialVersion" in data) ||
    typeof data.credentialVersion !== "string" ||
    !data.credentialVersion ||
    !("conversationNotificationsEnabled" in data) ||
    typeof data.conversationNotificationsEnabled !== "boolean"
  )
    throw new SessionError(502)
  return {
    userKey: data.userKey,
    expiresAt: data.expiresAt,
    credentialVersion: data.credentialVersion,
    conversationNotificationsEnabled: data.conversationNotificationsEnabled,
  }
}
