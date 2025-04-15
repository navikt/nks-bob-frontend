import { create } from "zustand"
import {
  MessageEvent as ConversationEvent,
  isCitationsUpdated,
  isContentUpdated,
  isContextUpdated,
  isErrorsUpdated,
  isNewMessage,
  isPendingUpdated,
  isStatusUpdate,
} from "../api/ws"
import { Message } from "./Message"

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
