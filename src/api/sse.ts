import { useTransition } from "react"
import { messageStore } from "../types/messageStore"
import { API_URL } from "./api"
import { MessageEvent as ConversationEvent } from "./ws"

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
                return JSON.parse(line.trim()) as ConversationEvent
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
