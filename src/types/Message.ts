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
}

export type Citation = {
  id: string
  text: string
  article: string
  title: string
  section: string
  createdAt: string
}

export type Context = {
  content: string
  metadata: Metadata[]
}

export type Metadata = {
  Tab: string
  Score: number
  Title: string
  Headers: null
  Section: string
  Fragment: string
  ArticleType: string
  ContentColumn: string
  DataCategories: [string]
  KnowledgeArticleId: string
  SemanticSimilarity: number
  KnowledgeArticle_QuartoUrl: string
}

export type NewConversation = {
  title: string
  initialMessage?: NewMessage
}

export type Conversation = {
  id: string
  title: string
  createdAt: string
  owner: string
}
