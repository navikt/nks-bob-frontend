import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode } from "react"
import { Link, MemoryRouter } from "react-router"
import { SWRConfig } from "swr"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NotificationSocket } from "../../api/conversationNotifications"
import { ConversationNotificationsProvider } from "./ConversationNotificationsProvider"
import { NotificationToggle } from "./NotificationDrawer"

const id = "00000000-0000-0000-0000-000000000001"

class FakeSocket implements NotificationSocket {
  static instances: FakeSocket[] = []
  onopen: NotificationSocket["onopen"] = null
  onmessage: NotificationSocket["onmessage"] = null
  onclose: NotificationSocket["onclose"] = null
  onerror: NotificationSocket["onerror"] = null
  close = vi.fn()
  constructor() {
    FakeSocket.instances.push(this)
  }
}

afterEach(() => {
  FakeSocket.instances = []
  vi.unstubAllGlobals()
})

async function setup() {
  vi.stubGlobal("WebSocket", FakeSocket)
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string) => {
      if (path === "/bff/session")
        return Response.json({
          userKey: "synthetic",
          credentialVersion: "v1",
          expiresAt: Date.now() + 3_600_000,
          conversationNotificationsEnabled: true,
        })
      return Response.json([])
    }),
  )
  const view = render(
    <StrictMode>
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <ConversationNotificationsProvider>
            <NotificationToggle />
            <label>
              Utkast
              <input />
            </label>
            <Link to={`/samtaler/${id}`}>Bytt samtale</Link>
          </ConversationNotificationsProvider>
        </MemoryRouter>
      </SWRConfig>
    </StrictMode>,
  )
  await waitFor(() => expect(FakeSocket.instances).toHaveLength(1))
  const socket = FakeSocket.instances[0]
  act(() => socket.onopen?.(new Event("open")))
  return { ...view, socket }
}

describe("app-level conversation notifications", () => {
  it("announces without stealing focus, opening the menu or changing a draft", async () => {
    const user = userEvent.setup()
    const { socket, unmount } = await setup()
    const input = screen.getByRole("textbox", { name: "Utkast" })
    await user.type(input, "Et pågående utkast")
    await act(async () =>
      socket.onmessage?.(
        new MessageEvent("message", {
          data: JSON.stringify({ type: "ConversationCreated", conversationId: id }),
        }),
      ),
    )
    expect(input).toHaveValue("Et pågående utkast")
    expect(input).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent("En ny samtale er opprettet")
    expect(screen.getByRole("button", { name: "Vis varsler" })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("link", { name: "Åpne samtalen" })).toHaveAttribute("href", `/samtaler/${id}`)
    await user.click(screen.getByRole("link", { name: "Bytt samtale" }))
    expect(FakeSocket.instances).toHaveLength(1)
    unmount()
    expect(socket.close).toHaveBeenCalledOnce()
    expect(socket.onmessage).toBeNull()
  })

  it("keeps a keyboard-activatable menu link after the persistent banner is dismissed", async () => {
    const user = userEvent.setup()
    const { socket } = await setup()
    await act(async () =>
      socket.onmessage?.(
        new MessageEvent("message", {
          data: JSON.stringify({ type: "ConversationCreated", conversationId: id }),
        }),
      ),
    )
    await user.click(screen.getByRole("button", { name: "Lukk samtalebeskjeden" }))
    expect(screen.queryByRole("link", { name: "Åpne samtalen" })).not.toBeInTheDocument()
    const toggle = screen.getByRole("button", { name: "Vis varsler" })
    toggle.focus()
    await user.keyboard("{Enter}")
    const link = await screen.findByRole("menuitem", { name: /Åpne samtalen/ })
    expect(link).toHaveAttribute("href", `/samtaler/${id}`)
  })
})
