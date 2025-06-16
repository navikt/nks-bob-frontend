import { useTransition } from "react"
import { Citation, Context, Message, MessageError } from "../types/Message"
import { messageStore } from "../types/messageStore"
import { API_URL } from "./api"

// Define necessary types from ws.ts directly here
export type MessageEvent =
  | NewMessageEvent
  | ContentUpdated
  | CitationsUpdated
  | ContextUpdated
  | PendingUpdated
  | StatusUpdate
  | ErrorsUpdated

type NewMessageEvent = {
  type: "NewMessage"
  id: string
  message: Message
}

type ContentUpdated = {
  type: "ContentUpdated"
  id: string
  content: string
}

type CitationsUpdated = {
  type: "CitationsUpdated"
  id: string
  citations: Citation[]
}

type ContextUpdated = {
  type: "ContextUpdated"
  id: string
  context: Context[]
}

type PendingUpdated = {
  type: "PendingUpdated"
  id: string
  message: Message
  pending: boolean
}

type StatusUpdate = {
  type: "StatusUpdate"
  id: string
  content: string
}

type ErrorsUpdated = {
  type: "ErrorsUpdated"
  id: string
  errors: MessageError[]
}

const CHUNK_SEP = "$#;"

export const useSendMessage = (conversationId: string) => {
  const [isLoading, startTransition] = useTransition()
  const { updateMessage } = messageStore()

  const sendMessage = ({ content }: { content: string }) =>
    startTransition(async () => {
      const response = await fetch(
        `${API_URL}/api/v1/conversations/${conversationId}/messages/sse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/event-stream",
          },
          body: JSON.stringify({
            content,
          }),
        },
      )

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        ?.getReader()

      // manual SSE line parsing, here be dragons...
      let buf = ""
      while (true) {
        const { value, done } = (await reader?.read()) ?? {
          value: null,
          done: false,
        }

        if (done) {
          console.debug("closing SSE session")
          break
        }

        if (value) {
          const newValue = buf + value
          buf = ""

          newValue
            .split("\r\n")
            .filter((str) => str)
            .reduce((prev, current) => {
              if (current.startsWith("data: ")) {
                return prev + current.replace("data: ", "") + CHUNK_SEP
              } else {
                return prev.replace(CHUNK_SEP, "") + current + CHUNK_SEP
              }
            }, "")
            .split(CHUNK_SEP)
            .filter((str) => str)
            .map((line) => {
              try {
                return JSON.parse(line.trim()) as MessageEvent
              } catch (_e) {
                buf = line
                return null
              }
            })
            .forEach((event) => {
              if (event) {
                updateMessage(event)
              }
            })
        }
      }
    })

  return {
    sendMessage,
    isLoading,
  }
}
