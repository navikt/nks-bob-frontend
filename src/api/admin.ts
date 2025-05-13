import useSWR from "swr"
import { Message } from "../types/Message"
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
