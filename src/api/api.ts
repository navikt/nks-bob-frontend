import { uniqBy } from "lodash"
import { useEffect, useState } from "react"
import useWebSocket, { ReadyState, useEventSource } from "react-use-websocket"
import useSWR, { mutate, preload } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Citation,
  Context,
  Conversation,
  Feedback,
  Message,
  NewConversation,
  NewMessage,
} from "../types/Message"
import { UserConfig } from "../types/User"

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

async function putter<Body, Response>(
  url: string,
  { arg }: { arg: Body },
): Promise<Response> {
  return fetcher(url, {
    method: "PUT",
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

export const preloadUserConfig = () => {
  preload("/api/v1/user/config", fetcher)
}

export const useUserConfig = () => {
  const { data, isLoading, error } = useSWR<UserConfig>(
    "/api/v1/user/config",
    fetcher,
    {
      revalidateOnReconnect: false,
    },
  )

  return {
    userConfig: data,
    isLoading,
    error,
  }
}

export const useUpdateUserConfig = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/v1/user/config",
    putter,
  )

  return {
    updateUserConfig: trigger as (
      userConfig: UserConfig,
    ) => Promise<UserConfig>,
    isLoading: isMutating,
    error,
  }
}

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
