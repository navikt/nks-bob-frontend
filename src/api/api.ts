import useSWR, { mutate } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Conversation,
  Feedback,
  Message,
  NewConversation,
} from "../types/Message"

const API_URL = `${import.meta.env.BASE_URL}bob-api`

async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const isLocal = import.meta.env.MODE === "development"
  const res = await fetch(`${API_URL}${input}`, {
    ...init,
    credentials: "include",
    headers: {
      ...init?.headers,
      ...(isLocal && {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      }),
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
