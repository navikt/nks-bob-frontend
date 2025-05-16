import useSWR from "swr"
import { Feedback, Message } from "../types/Message"
import { ApiError, fetcher } from "./api"

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
