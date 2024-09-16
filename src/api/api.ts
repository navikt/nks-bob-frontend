import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Message } from "../types/Message"

async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}${input}`,
    {
      ...init,
      // credentials: 'include',
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }
    })
  return res.json()
}

async function poster<Body, Response>(
  url: string,
  { arg }: { arg: Body }
): Promise<Response> {
  return fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(arg)
  })
}

export const useMessages = (conversationId: string) => {
  const { data: messages, isLoading, error } = useSWR<Message[]>(
    `/api/v1/conversations/${conversationId}/messages`,
    fetcher
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
    poster
  )

  return {
    sendMessage: trigger,
    isLoading: isMutating,
  }
}

