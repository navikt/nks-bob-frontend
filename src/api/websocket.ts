import { useEffect, useRef } from "react"
import { Citation, Contexts, Message, MessageError } from "../types/Message"
import { messageStore } from "../types/messageStore"

export type MessageEvent =
  | NewMessageEvent
  | ContentUpdated
  | CitationsUpdated
  | ContextUpdated
  | PendingUpdated
  | StatusUpdate
  | ErrorsUpdated
  | MessageUpdated

type NewMessageEvent = {
  type: "NewMessage"
  id: string
  message: Message
}

type ContentUpdated = {
  type: "ContentUpdated"
  id: string
  content: string
}

type CitationsUpdated = {
  type: "CitationsUpdated"
  id: string
  citations: Citation[]
}

type ContextUpdated = {
  type: "ContextUpdated"
  id: string
  context: Contexts
}

type PendingUpdated = {
  type: "PendingUpdated"
  id: string
  message: Message
  pending: boolean
}

type StatusUpdate = {
  type: "StatusUpdate"
  id: string
  content: string
}

type ErrorsUpdated = {
  type: "ErrorsUpdated"
  id: string
  errors: MessageError[]
}

type MessageUpdated = {
  type: "MessageUpdated"
  id: string
  message: Message
}

// Reconnect with a fixed backoff. The socket is expected to stay open for as
// long as the conversation is open, so we keep retrying until the component
// unmounts (conversation is closed) or a new conversationId takes over.
const RECONNECT_DELAY_MS = 1000

function buildWebSocketUrl(path: string): string {
  const base = `${import.meta.env.BASE_URL}bob-api-ws`
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}${base}${path}`
}

/**
 * Keeps a websocket connection open for as long as the conversation is
 * mounted, and forwards every message event to the shared message store.
 * Automatically reconnects if the connection drops unexpectedly.
 */
export const useConversationMessages = (conversationId: string | undefined) => {
  const updateMessage = messageStore((state) => state.updateMessage)
  const updateMessageRef = useRef(updateMessage)
  updateMessageRef.current = updateMessage

  useEffect(() => {
    if (!conversationId) {
      return
    }

    let socket: WebSocket | undefined
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined
    let closedByClient = false

    const connect = () => {
      socket = new WebSocket(buildWebSocketUrl(`/api/v2/conversations/${conversationId}/messages/ws`))

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          updateMessageRef.current(data)
        } catch (_) {
          // ignore malformed events
        }
      }

      socket.onclose = () => {
        if (!closedByClient) {
          reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    connect()

    return () => {
      closedByClient = true
      clearTimeout(reconnectTimeout)
      socket?.close()
    }
  }, [conversationId])
}
