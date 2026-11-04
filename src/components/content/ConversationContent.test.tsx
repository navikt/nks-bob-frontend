import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Link, MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Message } from "../../types/Message"
import { messageStore } from "../../types/messageStore"
import ConversationContent from "./ConversationContent"

const { histories, loading, setFollowUp } = vi.hoisted(() => ({
  histories: new Map<string, Message[]>(),
  loading: new Set<string>(),
  setFollowUp: vi.fn(),
}))

vi.mock("../../api/api.ts", () => ({
  useMessages: (id: string) => ({
    messages: histories.get(id) ?? [],
    isLoading: loading.has(id),
  }),
  useSendMessage: () => ({
    sendMessage: vi.fn(),
    isLoading: messageStore((state) => state.messages.some((message) => message.pending)),
  }),
  useAlerts: () => ({ alerts: [] }),
  isApiError: () => false,
}))
vi.mock("../header/Header.tsx", () => ({ default: () => null }))
vi.mock("../inputfield/InputField.tsx", () => ({
  default: () => null,
  useInputFieldStore: () => ({ setFollowUp }),
}))
vi.mock("./admin/menu/AdminMenu.tsx", () => ({ default: () => null }))
vi.mock("./chat/chatbubbles/sources/ShowAllSources.tsx", () => ({ ShowAllSources: () => null }))
vi.mock("./wrappers/DialogWrapper.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock("./chat/ChatContainer.tsx", () => ({
  default: ({ messages }: { messages: Message[] }) => (
    <output aria-label='Conversation messages'>{messages.map((message) => message.content).join("|")}</output>
  ),
}))

class TestSocket {
  static instances: TestSocket[] = []
  onopen: WebSocket["onopen"] = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: WebSocket["onclose"] = null
  onerror: WebSocket["onerror"] = null
  close = vi.fn()
  constructor(public url: string) {
    TestSocket.instances.push(this)
  }
}

function message(id: string, pending = false): Message {
  return {
    id,
    content: id,
    createdAt: "2026-01-01T00:00:00Z",
    messageType: "answer",
    messageRole: "ai",
    createdBy: "synthetic",
    citations: [],
    context: {},
    pending,
    errors: [],
    followUp: [],
    contextualizedQuestion: null,
    tools: [],
    thinking: [],
  }
}

function app() {
  return (
    <MemoryRouter initialEntries={["/samtaler/old"]}>
      <Link to='/samtaler/new'>Open notified conversation</Link>
      <Link to='/samtaler/old'>Return to old conversation</Link>
      <Routes>
        <Route
          path='/samtaler/:conversationId'
          element={<ConversationContent />}
        />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  histories.clear()
  loading.clear()
  TestSocket.instances = []
  messageStore.getState().resetMessages()
  vi.stubGlobal("WebSocket", TestSocket)
})
afterEach(() => {
  vi.unstubAllGlobals()
  messageStore.getState().resetMessages()
})

describe("conversation navigation", () => {
  it.each([
    { newMessages: [] },
    { newMessages: [message("new-answer")] },
    { newMessages: [message("new-one"), message("new-two")] },
  ])("replaces the previous history when opening a notified conversation: %j", async ({ newMessages }) => {
    histories.set("old", [message("old-one"), message("old-two")])
    histories.set("new", newMessages)
    render(app())
    expect(screen.getByLabelText("Conversation messages")).toHaveTextContent("old-one|old-two")

    await userEvent.click(screen.getByRole("link", { name: "Open notified conversation" }))
    expect(messageStore.getState().messages).toEqual(newMessages)
    expect(screen.getByLabelText("Conversation messages")).not.toHaveTextContent("old-one")

    await userEvent.click(screen.getByRole("link", { name: "Return to old conversation" }))
    expect(screen.getByLabelText("Conversation messages")).toHaveTextContent("old-one|old-two")
    expect(screen.getByLabelText("Conversation messages")).not.toHaveTextContent("new-answer")
  })

  it("clears a pending old conversation while the new history loads and ignores late socket events", async () => {
    histories.set("old", [message("old-stream", true)])
    histories.set("new", [message("new-answer")])
    loading.add("new")
    const view = render(app())
    const oldSocket = TestSocket.instances[0]
    const lateMessage = oldSocket.onmessage?.bind(oldSocket)

    await userEvent.click(screen.getByRole("link", { name: "Open notified conversation" }))
    expect(messageStore.getState().messages).toEqual([])
    expect(oldSocket.close).toHaveBeenCalledOnce()

    act(() => {
      lateMessage?.(
        new MessageEvent("message", {
          data: JSON.stringify({ type: "NewMessage", id: "late-old", message: message("late-old", true) }),
        }),
      )
    })
    expect(messageStore.getState().messages).toEqual([])

    loading.delete("new")
    view.rerender(app())
    expect(messageStore.getState().messages).toEqual([message("new-answer")])
    const newSocket = TestSocket.instances.at(-1)!
    expect(newSocket.url).toContain("/new/messages/ws")
    act(() => {
      newSocket.onmessage?.call(
        newSocket,
        new MessageEvent("message", {
          data: JSON.stringify({ type: "NewMessage", id: "new-stream", message: message("new-stream", true) }),
        }),
      )
    })
    expect(messageStore.getState().messages.map((item) => item.id)).toEqual(["new-answer", "new-stream"])
  })
})
