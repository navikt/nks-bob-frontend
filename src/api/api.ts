import useSWR, { mutate, preload } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Conversation,
  ConversationFeedback,
  Feedback,
  Message,
  NewConversation,
  NewMessage,
} from "../types/Message"
import { Alert, NewsNotification } from "../types/Notifications"
import { UserConfig } from "../types/User"
import { isSalesforceMode } from "../utils/iframe"

export const API_URL = isSalesforceMode()
  ? `https://bob.ansatt.dev.nav.no/bob-api` // TODO support multiple envs.
  : `${import.meta.env.BASE_URL}bob-api`

export type ApiError = {
  status: number
  message: string
  data: any
}

export async function fetcher<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
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

export const request = (method: "POST" | "PUT" | "PATCH" | "DELETE") =>
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
    sendFeedback: trigger as (
      feedback: ConversationFeedback,
    ) => Promise<Feedback>,
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

  const byDate: (a: NewsNotification, b: NewsNotification) => number = (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  return {
    newsNotifications: (data ?? []).sort(byDate),
    isLoading,
    error,
  }
}

export const useAlerts = () => {
  const { data, isLoading, error } = useSWR<Alert[], ApiError>(
    "/api/v1/notifications/errors",
    fetcher,
  )

  return {
    alerts: data ?? [],
    isLoading,
    error,
  }
}

export const preloadNewsNotifications = () => {
  preload("/api/v1/notifications/news", fetcher)
}

export const preloadAlerts = () => {
  preload("/api/v1/notifications/errors", fetcher)
}

export const useAddFeedback = (messageId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/messages/${messageId}/feedback`,
    request("POST"),
  )

  const addFeedback = (body: { options: string[]; comment: string | null }) =>
    trigger(body)

  return {
    addFeedback,
    isLoading: isMutating,
  }
}

let hasTriggeredAuth = false
export const triggerReAuth = () => {
  if (hasTriggeredAuth) return
  hasTriggeredAuth = true

  const loginUrl = new URL("/login", window.location.origin)
  loginUrl.searchParams.set("referer", window.location.href)

  window.location.href = loginUrl.toString()
}
