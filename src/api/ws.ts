import { useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import {
  Citation,
  Context,
  Message,
  MessageError,
  NewMessage,
} from "../types/Message"

const WS_API_URL = `${import.meta.env.BASE_URL}bob-api-ws`

export type MessageEvent =
  | NewMessageEvent
  | ContentUpdated
  | CitationsUpdated
  | ContextUpdated
  | PendingUpdated
  | StatusUpdate
  | ErrorsUpdated

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
  context: Context[]
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

export function isMessage(event: Message | MessageEvent): event is Message {
  return (<Message>event).messageRole !== undefined
}

export function isMessageEvent(
  event: Message | MessageEvent,
): event is MessageEvent {
  return (<MessageEvent>event).type !== undefined
}

export function isNewMessage(event: MessageEvent): event is NewMessageEvent {
  return (<MessageEvent>event).type === "NewMessage"
}

export function isContentUpdated(event: MessageEvent): event is ContentUpdated {
  return (<MessageEvent>event).type === "ContentUpdated"
}

export function isCitationsUpdated(
  event: MessageEvent,
): event is CitationsUpdated {
  return (<MessageEvent>event).type === "CitationsUpdated"
}

export function isContextUpdated(event: MessageEvent): event is ContextUpdated {
  return (<MessageEvent>event).type === "ContextUpdated"
}

export function isPendingUpdated(event: MessageEvent): event is PendingUpdated {
  return (<MessageEvent>event).type === "PendingUpdated"
}

export function isStatusUpdate(event: MessageEvent): event is StatusUpdate {
  return (<MessageEvent>event).type === "StatusUpdate"
}

export function isErrorsUpdated(event: MessageEvent): event is ErrorsUpdated {
  return (<MessageEvent>event).type === "ErrorsUpdated"
}

type MessageMap = { [id: string]: Message }

export const useMessagesSubscription = (conversationId: string) => {
  const [messages, setMessages] = useState<MessageMap>({})
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<
    Message | MessageEvent
  >(`${WS_API_URL}/api/v1/conversations/${conversationId}/messages/ws`, {
    shouldReconnect: (_closeEvent) => true,
    reconnectInterval: 5000,
    reconnectAttempts: 10,
    heartbeat: {
      message: JSON.stringify({ type: "Heartbeat", data: "ping" }),
      returnMessage: "pong",
      timeout: 60_000,
      interval: 25_000,
    },
  })

  const getMessage = (
    received: Message | MessageEvent,
    prev: MessageMap,
  ): Message | undefined => {
    if (isMessage(received)) {
      return received
    }

    if (!isMessageEvent(received)) {
      return undefined
    }

    if (isNewMessage(received)) {
      return received.message
    }

    const prevMessage = prev[received.id]
    if (!prevMessage) {
      return undefined
    }

    if (isContentUpdated(received)) {
      return {
        ...prevMessage,
        content: `${prevMessage.content}${received.content}`,
      }
    }

    if (isCitationsUpdated(received)) {
      return {
        ...prevMessage,
        citations: received.citations,
      }
    }

    if (isContextUpdated(received)) {
      return {
        ...prevMessage,
        context: received.context,
      }
    }

    if (isPendingUpdated(received)) {
      return received.message
    }

    return undefined
  }

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessages((prev) => {
        const newMessage = getMessage(lastJsonMessage, prev)
        if (!newMessage) {
          return prev
        }

        return {
          ...prev,
          [newMessage.id]: newMessage,
        }
      })
    }
  }, [lastJsonMessage])

  const sendMessage = (message: NewMessage) =>
    sendJsonMessage({
      type: "NewMessage",
      data: message,
    })

  const byDate: ((a: Message, b: Message) => number) | undefined = (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

  const sortedMessages = Object.values(messages).sort(byDate)

  return {
    sendMessage,
    messages: sortedMessages,
    isLoading:
      readyState !== ReadyState.OPEN ||
      sortedMessages.some((message) => message.pending),
  }
}
