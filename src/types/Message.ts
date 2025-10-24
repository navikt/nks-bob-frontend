export type MessageType = "question" | "answer"

export type MessageRole = "human" | "ai"

export type ConversationFeedback = {
  liked: boolean
}

export type NewMessage = {
  content: string
}

export type Message = {
  id: string
  content: string
  createdAt: string
  messageType: MessageType
  messageRole: MessageRole
  createdBy: string
  citations: Citation[]
  context: Context[]
  pending: boolean
  errors: MessageError[]
  followUp: string[]
  starred?: boolean
}

export type Citation = {
  text: string
  sourceId: number
}

export type Context = {
  content: string
  title: string
  ingress: string
  source: "nks" | "navno"
  url: string
  anchor: string | null
  articleId: string
  articleColumn: string | null
  lastModified: string | null
  semanticSimilarity: number
}

export type MessageError = { title: string; description: string }

export type SourceType = "nks" | "navno"

export type NewConversation = {
  title: string
  initialMessage: NewMessage | null
}

export type Conversation = {
  id: string
  title: string
  createdAt: string
}

export type Feedback = {
  id: string
  createdAt: string
  messageId: string | null
  conversationId: string | null
  options: string[]
  comment: string | null
  resolved: boolean
  resolvedCategory: string | null
  resolvedImportance: string | null
  resolvedNote: string | null
  domain: string | null
}
