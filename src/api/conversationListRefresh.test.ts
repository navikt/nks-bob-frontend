import { describe, expect, it, vi } from "vitest"
import { CONVERSATIONS_KEY } from "./api"
import { createConversationListRefresher } from "./conversationListRefresh"

describe("event-driven conversation cache", () => {
  it("fetches even without a mounted SWR subscriber and updates the actual cache key", async () => {
    const data = [{ id: "synthetic-conversation", title: "Test", createdAt: "2026-01-01" }]
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(data)),
    )
    const mutate = vi.fn(async () => undefined)
    const refresh = createConversationListRefresher(mutate)
    await refresh(new AbortController().signal)
    expect(fetch).toHaveBeenCalledOnce()
    expect(mutate).toHaveBeenCalledWith(CONVERSATIONS_KEY, data, { revalidate: false })
    vi.unstubAllGlobals()
  })

  it("coalesces an event burst but performs a trailing fetch for events during the request", async () => {
    let resolve!: (response: Response) => void
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done
          }),
      )
      .mockResolvedValueOnce(Response.json([]))
    vi.stubGlobal("fetch", fetch)
    const refresh = createConversationListRefresher(vi.fn(async () => undefined))
    const signal = new AbortController().signal
    const first = refresh(signal)
    const second = refresh(signal)
    const third = refresh(signal)
    resolve(Response.json([]))
    await Promise.all([first, second, third])
    expect(fetch).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
  })

  it("never populates a new user's cache with a response from the old session", async () => {
    let resolve!: (response: Response) => void
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((done) => {
            resolve = done
          }),
      ),
    )
    const mutate = vi.fn(async () => undefined)
    const refresh = createConversationListRefresher(mutate)
    const abort = new AbortController()
    const request = refresh(abort.signal)
    abort.abort()
    resolve(Response.json([]))
    await request
    expect(mutate).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
