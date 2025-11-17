import { useTransition } from "react"
import { Citation, Context, Message, MessageError } from "../types/Message"
import { messageStore } from "../types/messageStore"
import { API_URL } from "./api"

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

function createSSEParser(onEvent: (data: any) => void) {
  let buffer = ""
  let eventLines: string[] = []

  const processBuffer = () => {
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop()! // keep last incomplete line

    for (const line of lines) {
      if (line === "") {
        // End of event
        if (eventLines.length > 0) {
          const dataLines = eventLines.filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim())

          if (dataLines.length > 0) {
            try {
              const json = JSON.parse(dataLines.join("\n"))
              onEvent(json)
            } catch (_) {
              // ignore JSON errors
            }
          }
          eventLines = []
        }
      } else {
        eventLines.push(line)
      }
    }
  }

  return {
    push(chunk: string) {
      buffer += chunk
      processBuffer()
    },
    flush() {
      processBuffer()
    },
  }
}

export const useSendMessage = (conversationId: string) => {
  const [isLoading, startTransition] = useTransition()
  const { updateMessage } = messageStore()

  const sendMessage = ({ content }: { content: string }) => {
    const controller = new AbortController()

    const flushQueue = (queue: any[]) => {
      if (queue.length > 0) {
        const batch = queue.splice(0, queue.length)
        startTransition(() => {
          batch.forEach((event) => {
            updateMessage(event)
          })
        })
      }
    }

    ;(async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages/sse`, {
          method: "POST",
          headers: { "Content-Type": "text/event-stream" },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        })

        const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()

        if (!reader) return

        const MAX_FPS = 20
        const FRAME_MS = 1000 / MAX_FPS

        const MAX_CHUNKS_PER_FRAME = 20
        let chunkCount = 0

        let queue: any[] = []

        // flush queue to React at most 20x per second
        const interval = setInterval(() => {
          flushQueue(queue)
          chunkCount = 0 // reset input throttle window
        }, FRAME_MS)

        const parser = createSSEParser((event) => {
          queue.push(event)
        })

        while (true) {
          // ---- input throttle ----
          if (chunkCount >= MAX_CHUNKS_PER_FRAME) {
            await new Promise((r) => setTimeout(r, FRAME_MS))
            chunkCount = 0
          }

          const { value, done } = await reader.read()
          if (done) {
            break
          }

          if (value) {
            chunkCount++
            parser.push(value)
          }
        }

        parser.flush()
        flushQueue(queue)
        clearInterval(interval)
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("SSE error", e)
        }
      }
    })()

    return controller
  }

  return { sendMessage, isLoading }
}
