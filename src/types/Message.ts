export type MessageType = "question" | "answer"

export type MessageRole = "human" | "ai"

export type Feedback = {
  liked: boolean
}

export type NewMessage = {
  content: string
}

export type Message = {
  id: string
  content: string
  createdAt: string
  feedback: Feedback
  messageType: MessageType
  messageRole: MessageRole
  createdBy: string
  citations: Citation[]
  context: Context[]
  pending: boolean
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

export type SourceType = "nks" | "navno"

export type NewConversation = {
  title: string
  initialMessage: NewMessage | null
}

export type Conversation = {
  id: string
  title: string
  createdAt: string
  owner: string
}
