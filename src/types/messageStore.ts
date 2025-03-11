import { create } from "zustand"
import {
  MessageEvent as ConversationEvent,
  isCitationsUpdated,
  isContentUpdated,
  isContextUpdated,
  isNewMessage,
  isPendingUpdated,
} from "../api/ws"
import { Message } from "./Message"

type MessageState = {
  messages: Message[]
  addMessage: (message: Message) => void
  updateMessage: (event: ConversationEvent) => void
  setMessages: (messages: Message[]) => void
  resetMessages: () => void
}

export const messageStore = create<MessageState>()((set) => {
  const updateMessage = (event: ConversationEvent) =>
    set((state) => {
      const message = getMessage(event, state.messages)

      if (!message) {
        return state
      }

      const otherMessages = state.messages.filter(({ id }) => id !== event.id)

      return {
        ...state,
        messages: [...otherMessages, message],
      }
    })

  return {
    messages: [],
    addMessage: (message) =>
      set((state) => ({ ...state, messages: [...state.messages, message] })),
    updateMessage,
    setMessages: (messages) => set((state) => ({ ...state, messages })),
    resetMessages: () => set((state) => ({ ...state, messages: [] })),
  }
})

const getMessage = (
  event: ConversationEvent,
  messages: Message[],
): Message | undefined => {
  if (isNewMessage(event)) {
    return event.message
  }

  const message = messages.find((message) => message.id === event.id)
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

  return undefined
}
