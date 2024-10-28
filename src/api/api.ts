import { uniqBy } from "lodash"
import { useEffect, useState } from "react"
import useWebSocket, { ReadyState, useEventSource } from "react-use-websocket"
import useSWR, { mutate } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Conversation,
  Feedback,
  Message,
  NewConversation,
  NewMessage,
} from "../types/Message"

const API_URL = `${import.meta.env.BASE_URL}bob-api`

const WS_API_URL = `${import.meta.env.BASE_URL}bob-api-ws`

async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${input}`, {
    ...init,
    credentials: "include",
    headers: {
      ...init?.headers,
    },
  })
  if (res.status === 204) {
    return {} as T
  }

  return res.json() as Promise<T>
}

async function poster<Body, Response>(
  url: string,
  { arg }: { arg: Body },
): Promise<Response> {
  return fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(arg),
  })
}

async function deleter<Response>(url: string): Promise<Response> {
  return fetcher(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
}

export const useMessages = (conversationId: string) => {
  const {
    data: messages,
    isLoading,
    error,
  } = useSWR<Message[]>(
    `/api/v1/conversations/${conversationId}/messages`,
    fetcher,
    { refreshInterval: 1000 },
  )

  return {
    messages,
    isLoading,
    error,
  }
}

export const useSendMessage = (conversationId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations/${conversationId}/messages`,
    poster,
  )

  return {
    sendMessage: trigger,
    isLoading: isMutating,
  }
}

export const useSendMessagePost = (conversationId: string) => {
  const sendMessage = (newMessage: NewMessage) =>
    poster(`/api/v1/conversations/${conversationId}/messages`, {
      arg: newMessage,
    })

  return {
    sendMessage,
  }
}

export const useSendFeedback = (message: Message) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/messages/${message.id}/feedback`,
    poster,
  )

  return {
    sendFeedback: trigger as (feedback: Feedback) => Promise<Feedback>,
    isLoading: isMutating,
  }
}

export const useConversations = () => {
  const {
    data: conversations,
    isLoading,
    error,
  } = useSWR<Conversation[]>(`/api/v1/conversations`, fetcher)

  return {
    conversations,
    isLoading,
    error,
  }
}

export const useCreateConversation = () => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations`,
    poster,
  )

  return {
    createConversation: trigger as (
      newConversation: NewConversation,
      // TODO add options/config
    ) => Promise<Conversation>,
    isLoading: isMutating,
  }
}

export const useDeleteConversation = (conversation: Conversation) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations/${conversation.id}`,
    async (url) => {
      await deleter(url)
      await mutate(`/api/v1/conversations`)
    },
  )
  return {
    deleteConversation: trigger,
    isLoading: isMutating,
  }
}

export const useMessagesSubscription = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const { sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket<Message>(
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

  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessages((prev) =>
        // Reverse to add newest (last) messages to the array, then reverse again.
        uniqBy(prev.concat(lastJsonMessage).reverse(), "id").reverse(),
      )
    }
  }, [lastJsonMessage])

  return {
    sendMessage: sendJsonMessage,
    messages,
    isLoading: readyState !== ReadyState.OPEN,
  }
}

export const useMessagesEventSource = (
  conversationId: string,
): { messages: Message[]; isLoading: boolean } => {
  const [messages, setMessages] = useState<Message[]>([])

  useEventSource(
    `${API_URL}/api/v1/conversations/${conversationId}/messages/sse`,
    {
      withCredentials: true,
      onClose(event) {
        console.log("SSE connection closed", event)
      },
      onError(event) {
        console.error("SSE error", event)
      },
      onMessage(event) {
        const message = JSON.parse(event.data) as Message
        setMessages((prev) =>
          uniqBy(prev.concat(message).reverse(), "id").reverse(),
        )
      },
      onOpen(event) {
        console.log("SSE connection opened", event)
      },
      heartbeat: true,
      reconnectInterval: 100,
      reconnectAttempts: 1_000,
      shouldReconnect(event) {
        console.log("should reconnect")
        console.log(event)
        return true
      },
      retryOnError: true,
    },
  )

  const compareDates = (
    { createdAt: a }: Message,
    { createdAt: b }: Message,
  ) => {
    return new Date(a).getTime() - new Date(b).getTime()
  }

  return {
    messages: messages.sort(compareDates),
    isLoading: messages.some((message) => message.pending),
  }
}
