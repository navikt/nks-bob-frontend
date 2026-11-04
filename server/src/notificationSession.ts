import { getToken } from "@navikt/oasis"
import { createHash } from "node:crypto"
import type { Request, Response } from "express"
import type { IncomingMessage } from "node:http"
import type { Duplex } from "node:stream"
import { Socket } from "node:net"
import type { TokenResult } from "./utils.js"

export const notificationPath = "/bob-api-ws/api/v2/conversations/notifications/ws"
export const notificationsEnabled = () => process.env.CONVERSATION_NOTIFICATIONS_ENABLED === "true"

type TokenMetadata = { exp: number; oid?: string; sub?: string; tid?: string; NAVident?: string }
type SessionDependencies = {
  token: (req: IncomingMessage) => Promise<TokenResult>
  enabled: () => boolean
  local: boolean
  warn: (category: string) => void
}

function metadata(token: string): TokenMetadata {
  const value: unknown = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"))
  if (
    typeof value !== "object" ||
    value === null ||
    !("exp" in value) ||
    typeof value.exp !== "number" ||
    !Number.isFinite(value.exp)
  )
    throw new Error("Missing token expiry")
  return {
    exp: value.exp,
    oid: "oid" in value && typeof value.oid === "string" ? value.oid : undefined,
    sub: "sub" in value && typeof value.sub === "string" ? value.sub : undefined,
    tid: "tid" in value && typeof value.tid === "string" ? value.tid : undefined,
    NAVident:
      "NAVident" in value && typeof value.NAVident === "string" && value.NAVident.trim()
        ? value.NAVident
        : undefined,
  }
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex")

export function notificationSessionHandler(dependencies: SessionDependencies) {
  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store")
    // No user metadata or token exchange is needed while subscriptions are disabled.
    if (!dependencies.enabled()) {
      res.json({ conversationNotificationsEnabled: false })
      return
    }
    try {
      const subjectToken = dependencies.local ? undefined : getToken(req)
      if (!dependencies.local && !subjectToken) {
        res.status(401).json({ error: "Authentication required" })
        return
      }
      let subject: TokenMetadata | undefined
      if (subjectToken) {
        try {
          subject = metadata(subjectToken)
        } catch {
          res.status(401).json({ error: "Authentication required" })
          return
        }
      }
      if (subject && subject.exp * 1000 <= Date.now()) {
        res.status(401).json({ error: "Authentication required" })
        return
      }
      const result = await dependencies.token(req)
      if (!result.ok) {
        dependencies.warn("notification-session:token-exchange-unavailable")
        res.status(503).json({ error: "Session temporarily unavailable" })
        return
      }
      const obo = metadata(result.data)
      const identity = subject ?? obo
      const user =
        identity.oid ??
        identity.sub ??
        (dependencies.local && identity.NAVident ? `local-navident:${identity.NAVident}` : undefined)
      if (!user || obo.exp * 1000 <= Date.now()) {
        dependencies.warn("notification-session:invalid-token-metadata")
        res.status(503).json({ error: "Session temporarily unavailable" })
        return
      }
      res.json({
        userKey: digest(`conversation-notifications:${identity.tid ?? ""}:${user}`),
        credentialVersion: digest(result.data),
        expiresAt: Math.min(subject?.exp ?? obo.exp, obo.exp) * 1000,
        conversationNotificationsEnabled: true,
      })
    } catch {
      dependencies.warn("notification-session:unavailable")
      res.status(503).json({ error: "Session temporarily unavailable" })
    }
  }
}

export function authenticatedWebSocketUpgrade(
  dependencies: Omit<SessionDependencies, "local"> & {
    upgrade: (req: IncomingMessage, socket: Socket, head: Buffer) => void | Promise<void>
  },
) {
  return async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const reject = (status: string) => {
      socket.end(`HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`, () => socket.destroy())
    }
    let pathname: string
    try {
      pathname = new URL(req.url ?? "/", "http://localhost").pathname
    } catch {
      reject("400 Bad Request")
      return
    }
    if (
      pathname !== notificationPath &&
      !/^\/bob-api-ws\/api\/v2\/conversations\/[0-9a-f-]+\/messages\/ws$/i.test(pathname)
    ) {
      reject("404 Not Found")
      return
    }
    if (pathname === notificationPath && !dependencies.enabled()) {
      reject("503 Service Unavailable")
      return
    }
    try {
      if (!(socket instanceof Socket)) {
        reject("503 Service Unavailable")
        return
      }
      const result = await dependencies.token(req)
      if (socket.destroyed) return
      if (!result.ok) {
        dependencies.warn("websocket:authentication-unavailable")
        reject("401 Unauthorized")
        return
      }
      req.headers.authorization = `Bearer ${result.data}`
      await dependencies.upgrade(req, socket, head)
    } catch {
      dependencies.warn("websocket:upgrade-unavailable")
      reject("503 Service Unavailable")
    }
  }
}
