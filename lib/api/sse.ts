"use client"

import { useTransition } from "react"
import { messageStore } from "../stores/messageStore"

export type { SseEvent as MessageEvent } from "../../types/SseEvent"

export const useSendMessage = (conversationId: string) => {
  const [isLoading, startTransition] = useTransition()
  const { updateMessage } = messageStore()

  const sendMessage = ({ content }: { content: string }) => {
    startTransition(async () => {
      const response = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok || !response.body) return

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split("\n")
        buffer = lines.pop()!
        for (const line of lines) {
          if (line.trim()) updateMessage(JSON.parse(line))
        }
      }

      if (buffer.trim()) updateMessage(JSON.parse(buffer))
    })
  }

  return { sendMessage, isLoading }
}
