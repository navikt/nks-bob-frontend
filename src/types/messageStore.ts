import { create } from "zustand"
import { MessageEvent as ConversationEvent } from "../api/sse"
import { Message } from "./Message"
import { transformNksUrlsArray } from "../utils/nksUrlTransformer"
import { transformArticleColumnArray } from "../utils/articleColumnTransformer"

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

const transformContextData = <T extends { url: string; articleColumn?: string | null }>(contexts: T[]): T[] => {
    let transformed = transformNksUrlsArray(contexts)

    if (contexts.length > 0 && 'articleColumn' in contexts[0]) {
      transformed = transformArticleColumnArray(transformed as any) as T[]
    }

    return transformed
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
      const transformedMessage = {
        ...message,
        context: transformContextData(message.context)
      }

      const messageMap = {
        ...state.messageMap,
        [transformedMessage.id]: transformedMessage,
      }

      return {
        ...state,
        messageMap,
        messages: Object.values(messageMap).sort(byDate),
      }
    })

  const setMessages = (messages: Message[]) =>
    set((state) => {
      const transformedMessages = messages.map(message => ({
        ...message,
        context: transformContextData(message.context)
      }))

      const messageMap: MessageMap = transformedMessages.reduce(
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
    return {
      ...event.message,
    context: transformContextData(event.message.context)
    }
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
      context: transformContextData(event.context),
    }
  }

  if (isPendingUpdated(event)) {
    return {
      ...event.message,
      context: transformContextData(event.message.context)
    }
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
