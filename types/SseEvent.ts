import { Citation, Contexts, Message, MessageError } from "./Message"

export type SseEvent =
  | NewMessageEvent
  | ContentUpdated
  | CitationsUpdated
  | ContextUpdated
  | PendingUpdated
  | StatusUpdate
  | ErrorsUpdated
  | MessageUpdated

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
  context: Contexts
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

type MessageUpdated = {
  type: "MessageUpdated"
  id: string
  message: Message
}
