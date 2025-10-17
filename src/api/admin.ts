import useSWR, { preload } from "swr"
import useSWRMutation from "swr/mutation"
import { Feedback, Message } from "../types/Message"
import { Alert, NewsNotification, Notification } from "../types/Notifications"
import { ApiError, fetcher, request } from "./api"

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

type SortType = "CREATED_AT_ASC" | "CREATED_AT_DESC"

export const useFeedbacks = (
  filters: string[],
  page: number = 0,
  size: number = 4,
  sort: SortType = "CREATED_AT_DESC",
) => {
  const params = new URLSearchParams()
  filters.forEach((value) => params.append("filter", value))
  params.append("page", page.toString())
  params.append("size", size.toString())
  params.append("sort", sort)

  const queryString = params.toString()
  const { data, isLoading, error } = useSWR<{ data: Feedback[]; total: number }, ApiError>(
    `/api/v1/admin/feedbacks?${queryString}`,
    fetcher,
  )

  const feedbacks = data?.data ?? []
  const total = data?.total ?? 0

  return {
    feedbacks,
    total,
    isLoading,
    error,
  }
}

export const preloadFeedbacks = (
  filters: string[],
  page: number = 0,
  size: number = 4,
  sort: SortType = "CREATED_AT_DESC",
) => {
  const params = new URLSearchParams()
  filters.forEach((value) => params.append("filter", value))
  params.append("page", page.toString())
  params.append("size", size.toString())
  params.append("sort", sort)

  const queryString = params.toString()
  preload(`/api/v1/admin/feedbacks?${queryString}`, fetcher)
}

export const useUpdateFeedback = (feedbackId: string) => {
  const { trigger, isMutating } = useSWRMutation(`/api/v1/admin/feedbacks/${feedbackId}`, request("PUT"))

  return {
    updateFeedback: trigger as (
      feedback: Omit<Feedback, "id" | "messageId" | "conversationId" | "createdAt">,
    ) => Promise<Feedback>,
    isLoading: isMutating,
  }
}

type CreateAlert = Omit<Alert, "id" | "createdAt" | "notificationType"> & {
  notificationType: "Error" | "Warning"
}

export const useCreateAlert = () => {
  const { trigger, isMutating } = useSWRMutation(`/api/v1/admin/notifications`, request("POST"))

  const createAlert = (alert: CreateAlert): Promise<Notification> => {
    return trigger(alert, {
      optimisticData: alert,
    }) as Promise<Notification>
  }

  return {
    createAlert,
    isLoading: isMutating,
  }
}

export const useUpdateAlert = (id: string) => {
  const { trigger, isMutating } = useSWRMutation(`/api/v1/admin/notifications/${id}`, request("PUT"))

  const updateAlert = (alert: CreateAlert): Promise<Notification> => {
    return trigger(alert, {
      optimisticData: alert,
    }) as Promise<Notification>
  }

  return {
    updateAlert,
    isLoading: isMutating,
  }
}

export const useDeleteAlert = (id: string) => {
  const { trigger, isMutating } = useSWRMutation(`/api/v1/admin/notifications/${id}`, request("DELETE"))

  return {
    deleteAlert: trigger,
    isLoading: isMutating,
  }
}

type CreateNews = Omit<NewsNotification, "id" | "createdAt">

export const useCreateNews = () => {
  const { trigger, isMutating } = useSWRMutation(`/api/v1/admin/notifications`, request("POST"))

  const createNews = (news: CreateNews): Promise<Notification> => {
    return trigger(
      { ...news, notificationType: "News", expiresAt: null },
      {
        optimisticData: news,
      },
    ) as Promise<Notification>
  }

  return {
    createNews,
    isLoading: isMutating,
  }
}
