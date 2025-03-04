import useSWR, { mutate, preload } from "swr"
import useSWRMutation from "swr/mutation"
import {
  Conversation,
  Feedback,
  Message,
  NewConversation,
  NewMessage,
} from "../types/Message"
import { UserConfig } from "../types/User"

const API_URL = `${import.meta.env.BASE_URL}bob-api`

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

async function patcher<Body, Response>(
  url: string,
  { arg }: { arg: Body },
): Promise<Response> {
  return fetcher(url, {
    method: "PATCH",
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

export const useSendConversationFeedback = (conversationId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/conversations/${conversationId}/feedback`,
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
  const { data, isLoading, error } = useSWR<UserConfig, ApiError>(
    "/api/v1/user/config",
    fetcher,
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
    patcher,
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
    putter,
  )

  const starMessage = (starred: boolean) =>
    trigger({
      id: messageId,
      starred,
    })

  return { starMessage, isMutating }
}
