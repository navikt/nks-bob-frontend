import { create } from "zustand"
import { MessageEvent as ConversationEvent } from "../api/sse"
import { Message } from "./Message"

// Type guard functions for MessageEvent types
function isNewMessage(event: ConversationEvent): event is { type: "NewMessage", id: string, message: Message } {
  return event.type === "NewMessage"
}

function isContentUpdated(event: ConversationEvent): event is { type: "ContentUpdated", id: string, content: string } {
  return event.type === "ContentUpdated"
}

function isCitationsUpdated(event: ConversationEvent): event is { type: "CitationsUpdated", id: string, citations: any[] } {
  return event.type === "CitationsUpdated"
}

function isContextUpdated(event: ConversationEvent): event is { type: "ContextUpdated", id: string, context: any[] } {
  return event.type === "ContextUpdated"
}

function isPendingUpdated(event: ConversationEvent): event is { type: "PendingUpdated", id: string, message: Message, pending: boolean } {
  return event.type === "PendingUpdated"
}

function isStatusUpdate(event: ConversationEvent): event is { type: "StatusUpdate", id: string, content: string } {
  return event.type === "StatusUpdate"
}

function isErrorsUpdated(event: ConversationEvent): event is { type: "ErrorsUpdated", id: string, errors: any[] } {
  return event.type === "ErrorsUpdated"
}

type MessageMap = { [id: string]: Message }

type MessageState = {
  messages: Message[]
  messageMap: MessageMap
  addMessage: (message: Message) => void
  updateMessage: (event: ConversationEvent) => void
  setMessages: (messages: Message[]) => void
  resetMessages: () => void
}

export const messageStore = create<MessageState>()((set) => {
  const byDate: ((a: Message, b: Message) => number) | undefined = (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

  const updateMessage = (event: ConversationEvent) =>
    set((state) => {
      const message = getMessage(event, state.messageMap)
      if (!message) {
        return state
      }

      const messageMap: MessageMap = {
        ...state.messageMap,
        [message.id]: message,
      }

      return {
        ...state,
        messageMap,
        messages: Object.values(messageMap).sort(byDate),
      }
    })

  const addMessage = (message: Message) =>
    set((state) => {
      const messageMap = {
        ...state.messageMap,
        [message.id]: message,
      }

      return {
        ...state,
        messageMap,
        messages: Object.values(messageMap).sort(byDate),
      }
    })

  const setMessages = (messages: Message[]) =>
    set((state) => {
      const messageMap: MessageMap = messages.reduce(
        (map, message) => Object.assign(map, { [message.id]: message }),
        {},
      )

      return {
        ...state,
        messageMap,
        messages: Object.values(messageMap).sort(byDate),
      }
    })

  return {
    messages: [],
    messageMap: {},
    addMessage,
    updateMessage,
    setMessages,
    resetMessages: () =>
      set((state) => ({ ...state, messageMap: {}, messages: [] })),
  }
})

const getMessage = (
  event: ConversationEvent,
  messages: MessageMap,
): Message | undefined => {
  if (isNewMessage(event)) {
    return event.message
  }

  const message = messages[event.id]
  if (!message) {
    return undefined
  }

  if (isContentUpdated(event)) {
    return {
      ...message,
      content: `${message.content}${event.content}`,
    }
  }

  if (isCitationsUpdated(event)) {
    return {
      ...message,
      citations: event.citations,
    }
  }

  if (isContextUpdated(event)) {
    return {
      ...message,
      context: event.context,
    }
  }

  if (isPendingUpdated(event)) {
    return event.message
  }

  if (isStatusUpdate(event)) {
    console.debug(`Status: ${event.content}`)
    return undefined
  }

  if (isErrorsUpdated(event)) {
    return {
      ...message,
      errors: event.errors,
      pending: false,
    }
  }

  return undefined
}
