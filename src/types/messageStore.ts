import { create } from "zustand"
import { MessageEvent as ConversationEvent } from "../api/sse"
import analytics from "../utils/analytics"
import { transformArticleColumnArray } from "../utils/articleColumnTransformer"
import { transformNksUrlsArray } from "../utils/nksUrlTransformer"
import { Citation, Contexts, Message } from "./Message"

// Type guard functions for MessageEvent types
function isNewMessage(event: ConversationEvent): event is { type: "NewMessage"; id: string; message: Message } {
  return event.type === "NewMessage"
}

function isContentUpdated(event: ConversationEvent): event is { type: "ContentUpdated"; id: string; content: string } {
  return event.type === "ContentUpdated"
}

function isCitationsUpdated(
  event: ConversationEvent,
): event is { type: "CitationsUpdated"; id: string; citations: Citation[] } {
  return event.type === "CitationsUpdated"
}

function isContextUpdated(
  event: ConversationEvent,
): event is { type: "ContextUpdated"; id: string; context: Contexts } {
  return event.type === "ContextUpdated"
}

function isPendingUpdated(
  event: ConversationEvent,
): event is { type: "PendingUpdated"; id: string; message: Message; pending: boolean } {
  return event.type === "PendingUpdated"
}

function isStatusUpdate(event: ConversationEvent): event is { type: "StatusUpdate"; id: string; content: string } {
  return event.type === "StatusUpdate"
}

function isErrorsUpdated(event: ConversationEvent): event is { type: "ErrorsUpdated"; id: string; errors: any[] } {
  return event.type === "ErrorsUpdated"
}

function isMessageUpdated(event: ConversationEvent): event is { type: "MessageUpdated"; id: string; message: Message } {
  return event.type === "MessageUpdated"
}

type MessageMap = { [id: string]: Message }

export const OPTIMISTIC_USER_MSG_ID = "optimistic-user-question"

type MessageState = {
  messages: Message[]
  messageMap: MessageMap
  addMessage: (message: Message) => void
  addOptimisticUserMessage: (content: string) => void
  removeOptimisticUserMessage: () => void
  updateMessage: (event: ConversationEvent) => void
  setMessages: (messages: Message[]) => void
  resetMessages: () => void
}

const transformContextData = (contexts: Contexts): Contexts => {
  let transformed = transformNksUrlsArray(contexts)

  const entries = Object.entries(contexts)
  const hasContexts = entries.length > 0
  const hasArticleColumn = "articleColumn" in entries.map(([_, c]) => c)

  if (hasContexts && hasArticleColumn) {
    transformed = transformArticleColumnArray(transformed)
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

      const newMessageMap: MessageMap = { ...state.messageMap }

      if (isNewMessage(event) && event.message.messageRole === "human") {
        delete newMessageMap[OPTIMISTIC_USER_MSG_ID]
      }

      newMessageMap[message.id] = message

      return {
        ...state,
        messageMap: newMessageMap,
        messages: Object.values(newMessageMap).sort(byDate),
      }
    })

  const addOptimisticUserMessage = (content: string) =>
    set((state) => {
      const optimisticMessage: Message = {
        id: OPTIMISTIC_USER_MSG_ID,
        content,
        createdAt: new Date().toISOString(),
        messageType: "question",
        messageRole: "human",
        createdBy: "",
        citations: [],
        context: {},
        pending: true,
        errors: [],
        followUp: [],
        contextualizedQuestion: null,
        tools: [],
        thinking: [],
      }

      const messageMap = {
        ...state.messageMap,
        [OPTIMISTIC_USER_MSG_ID]: optimisticMessage,
      }

      return {
        ...state,
        messageMap,
        messages: Object.values(messageMap).sort(byDate),
      }
    })

  const removeOptimisticUserMessage = () =>
    set((state) => {
      const { [OPTIMISTIC_USER_MSG_ID]: _, ...restMap } = state.messageMap
      return {
        ...state,
        messageMap: restMap,
        messages: Object.values(restMap).sort(byDate),
      }
    })

  const addMessage = (message: Message) =>
    set((state) => {
      const transformedMessage = {
        ...message,
        context: transformContextData(message.context),
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
      const transformedMessages = messages.map((message) => ({
        ...message,
        context: transformContextData(message.context),
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
    addOptimisticUserMessage,
    removeOptimisticUserMessage,
    updateMessage,
    setMessages,
    resetMessages: () => set((state) => ({ ...state, messageMap: {}, messages: [] })),
  }
})

const getMessage = (event: ConversationEvent, messages: MessageMap): Message | undefined => {
  if (isNewMessage(event)) {
    return {
      ...event.message,
      context: transformContextData(event.message.context),
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

  if (isMessageUpdated(event)) {
    return event.message
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
    if (!event.pending) {
      const messageLength = event.message.content.length
      const contextMeta = Object.entries(event.message.context).map(([_, { source, title }]) => ({
        tittel: title,
        kilde: source,
      }))
      const citationMeta = event.message.citations.map(({ sourceId }) => ({
        kildeId: sourceId,
      }))
      const tools = event.message.tools

      analytics.svarMottatt(
        event.id,
        messageLength,
        contextMeta,
        citationMeta,
        tools.map(({ name }) => name),
      )
    }

    return {
      ...event.message,
      context: transformContextData(event.message.context),
    }
  }

  if (isStatusUpdate(event)) {
    return {
      ...message,
      status: [event.content],
    }
  }

  if (isErrorsUpdated(event)) {
    event.errors.forEach(({ title, description }) => {
      analytics.svarFeilet(message.id, title, description)
    })

    return {
      ...message,
      errors: event.errors,
      pending: false,
    }
  }

  return undefined
}
