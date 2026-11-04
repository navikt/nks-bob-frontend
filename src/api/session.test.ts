import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchNotificationSession, SessionError } from "./session"

afterEach(() => vi.unstubAllGlobals())

describe("notification session boundary", () => {
  it("accepts a disabled flag without token exchange or user metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ conversationNotificationsEnabled: false })),
    )
    const result = await fetchNotificationSession(new AbortController().signal)
    expect(result.conversationNotificationsEnabled).toBe(false)
  })

  it("requires complete typed metadata when enabled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ conversationNotificationsEnabled: true, expiresAt: "later" })),
    )
    await expect(fetchNotificationSession(new AbortController().signal)).rejects.toEqual(new SessionError(502))
  })

  it("does not follow login redirects or invoke SWR's global reauth", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 401 }))
    vi.stubGlobal("fetch", fetch)
    await expect(fetchNotificationSession(new AbortController().signal)).rejects.toEqual(new SessionError(401))
    expect(fetch).toHaveBeenCalledWith(
      "/bff/session",
      expect.objectContaining({ redirect: "error", cache: "no-store" }),
    )
  })
})
