import { uniqBy } from "lodash"
import { useEffect, useState } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import {
  Citation,
  Context,
  Message,
  NewMessage,
} from "../types/Message"

const WS_API_URL = `${import.meta.env.BASE_URL}bob-api-ws`

type MessageEvent
  = NewMessageEvent
  | ContentUpdated
  | CitationsUpdated
  | ContextUpdated
  | PendingUpdated

type NewMessageEvent = {
  type: "NewMessage",
  id: string,
  message: Message,
}

type ContentUpdated = {
  type: "ContentUpdated"
  id: string,
  content: string
}

type CitationsUpdated = {
  type: "CitationsUpdated"
  id: string,
  citations: Citation[]
}

type ContextUpdated = {
  type: "ContextUpdated"
  id: string,
  context: Context[]
}

type PendingUpdated = {
  type: "PendingUpdated"
  id: string,
  message: Message,
  pending: boolean
}

function isMessage(event: Message | MessageEvent): event is Message {
  return (<Message>event).messageRole !== undefined
}

function isMessageEvent(event: Message | MessageEvent): event is MessageEvent {
  return (<MessageEvent>event).type !== undefined
}

function isNewMessage(event: MessageEvent): event is NewMessageEvent {
  return (<MessageEvent>event).type === "NewMessage"
}

function isContentUpdated(event: MessageEvent): event is ContentUpdated {
  return (<MessageEvent>event).type === "ContentUpdated"
}

function isCitationsUpdated(event: MessageEvent): event is CitationsUpdated {
  return (<MessageEvent>event).type === "CitationsUpdated"
}

function isContextUpdated(event: MessageEvent): event is ContextUpdated {
  return (<MessageEvent>event).type === "ContextUpdated"
}

function isPendingUpdated(event: MessageEvent): event is PendingUpdated {
  return (<MessageEvent>event).type === "PendingUpdated"
}

export const useMessagesSubscription = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<Message | MessageEvent>(
      `${WS_API_URL}/api/v1/conversations/${conversationId}/messages/ws`,
      {
        shouldReconnect: (_closeEvent) => true,
        reconnectInterval: 5000,
        reconnectAttempts: 10,
        heartbeat: {
          message: JSON.stringify({ type: "Heartbeat", data: "ping" }),
          returnMessage: "pong",
          timeout: 60_000,
          interval: 25_000,
        },
      },
    )

  const getMessage = (
    received: Message | MessageEvent,
    prev: Message[]
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

    const prevMessage = prev.find((message) => message.id === received.id)
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
      if (received.pending) {
        return received.message
      }

      return {
        ...prevMessage,
        pending: received.pending,
      }
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

        // Reverse to add newest (last) messages to the array, then reverse again.
        return uniqBy(prev.concat(newMessage).reverse(), "id").reverse()
      })
    }
  }, [lastJsonMessage])

  const sendMessage = (message: NewMessage) =>
    sendJsonMessage({
      type: "NewMessage",
      data: message
    })

  return {
    sendMessage,
    messages,
    isLoading: readyState !== ReadyState.OPEN || messages.some((message) => message.pending),
  }
}
