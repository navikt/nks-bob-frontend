import useSWR, { mutate, preload } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Conversation,
  Feedback,
  Message,
  NewConversation,
  NewMessage,
} from "../types/Message"
import { ErrorNotification, NewsNotification } from "../types/Notifications"
import { UserConfig } from "../types/User"

export const API_URL = `${import.meta.env.BASE_URL}bob-api`

type ApiError = {
  status: number
  message: string
  data: any
}

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

  if (res.status >= 400) {
    throw {
      status: res.status,
      message: res.statusText,
      data: await res.json(),
    } as ApiError
  }

  return res.json() as Promise<T>
}

const request = (method: "POST" | "PUT" | "PATCH" | "DELETE") =>
  async function <Body, Response>(
    url: string,
    options?: { arg: Body },
  ): Promise<Response> {
    const body = options && JSON.stringify(options.arg)
    return fetcher(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    })
  }

export const useAdminMessages = (conversationId: string) => {
  const { data, isLoading, error } = useSWR<Message[], ApiError>(
    `/api/v1/admin/conversations/${conversationId}/messages`,
    fetcher,
  )

  return {
    messages: data ?? [],
    isLoading,
    error,
  }
}

export const useSendMessage = (conversationId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations/${conversationId}/messages`,
    request("POST"),
  )

  return {
    sendMessage: trigger,
    isLoading: isMutating,
  }
}

export const useSendMessagePost = (conversationId: string) => {
  const sendMessage = (newMessage: NewMessage) =>
    request("POST")(`/api/v1/conversations/${conversationId}/messages`, {
      arg: newMessage,
    })

  return {
    sendMessage,
  }
}

export const useSendFeedback = (message: Message) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/messages/${message.id}/feedback`,
    request("POST"),
  )

  return {
    sendFeedback: trigger as (feedback: Feedback) => Promise<Feedback>,
    isLoading: isMutating,
  }
}

export const useSendConversationFeedback = (conversationId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations/${conversationId}/feedback`,
    request("POST"),
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
    request("POST"),
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
      await request("DELETE")(url)
      await mutate(`/api/v1/conversations`)
    },
  )
  return {
    deleteConversation: trigger,
    isLoading: isMutating,
  }
}

export const useMessages = (conversationId: string) => {
  const { data, isLoading, error } = useSWR<Message[], ApiError>(
    `/api/v1/conversations/${conversationId}/messages`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )

  return {
    messages: data ?? [],
    isLoading,
    error,
  }
}

export const preloadUserConfig = () => {
  preload("/api/v1/user/config", fetcher)
}

export const useUserConfig = () => {
  const { data, isLoading, error } = useSWR<UserConfig, ApiError>(
    "/api/v1/user/config",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
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
    request("PATCH"),
  )

  return {
    updateUserConfig: trigger as (
      userConfig: Partial<UserConfig>,
    ) => Promise<UserConfig>,
    isLoading: isMutating,
    error,
  }
}

export const useStarMessage = (messageId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/messages/${messageId}`,
    request("PUT"),
  )

  const starMessage = (starred: boolean) =>
    trigger({
      id: messageId,
      starred,
    })

  return { starMessage, isMutating }
}

export const useNewsNotifications = () => {
  const { data, isLoading, error } = useSWR<NewsNotification[], ApiError>(
    "/api/v1/notifications/news",
    fetcher,
  )

  return {
    newsNotifications: data ?? [],
    isLoading,
    error,
  }
}

export const useErrorNotifications = () => {
  const { data, isLoading, error } = useSWR<ErrorNotification[], ApiError>(
    "/api/v1/notifications/errors",
    fetcher,
  )

  return {
    errorNotifications: data ?? [],
    isLoading,
    error,
  }
}

export const preloadNewsNotifications = () => {
  preload("/api/v1/notifications/news", fetcher)
}

export const preloadErrorNotifications = () => {
  preload("/api/v1/notifications/errors", fetcher)
}

let hasTriggeredAuth = false
export const triggerReAuth = () => {
  if (hasTriggeredAuth) return
  hasTriggeredAuth = true

  const loginUrl = new URL("/login", window.location.origin)
  loginUrl.searchParams.set("referer", window.location.href)

  window.location.href = loginUrl.toString()
}
