import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Feedback, Message } from "../types/Message"
import { ErrorNotification, Notification } from "../types/Notifications"
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

export const useFeedbacks = (filter: string | null) => {
  const filterQuery = filter ? `?filter=${filter}` : ""
  const { data, isLoading, error } = useSWR<Feedback[], ApiError>(
    `/api/v1/admin/feedbacks${filterQuery}`,
    fetcher,
  )

  return {
    feedbacks: data ?? [],
    isLoading,
    error,
  }
}

export const useUpdateFeedback = (feedbackId: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/admin/feedbacks/${feedbackId}`,
    request("PUT"),
  )

  return {
    updateFeedback: trigger as (
      feedback: Omit<
        Feedback,
        "id" | "messageId" | "conversationId" | "createdAt"
      >,
    ) => Promise<Feedback>,
    isLoading: isMutating,
  }
}

type CreateErrorNotification = Omit<
  ErrorNotification,
  "id" | "createdAt" | "notificationType"
> & {
  notificationType: "Error" | "Warning"
}

export const useCreateErrorNotification = () => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/admin/notifications`,
    request("POST"),
  )

  const createErrorNotification = (
    errorNotification: CreateErrorNotification,
  ): Promise<Notification> => {
    return trigger(errorNotification, {
      optimisticData: errorNotification,
    }) as Promise<Notification>
  }

  return {
    createErrorNotification,
    isLoading: isMutating,
  }
}

export const useUpdateErrorNotification = (id: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/admin/notifications/${id}`,
    request("PUT"),
  )

  const updateErrorNotification = (
    errorNotification: CreateErrorNotification,
  ): Promise<Notification> => {
    return trigger(errorNotification, {
      optimisticData: errorNotification,
    }) as Promise<Notification>
  }

  return {
    updateErrorNotification,
    isLoading: isMutating,
  }
}

export const useDeleteErrorNotification = (id: string) => {
  const { trigger, isMutating } = useSWRMutation(
    `/api/v1/admin/notifications/${id}`,
    request("DELETE"),
  )

  return {
    deleteErrorNotification: trigger,
    isLoading: isMutating,
  }
}
