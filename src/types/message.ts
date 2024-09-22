export enum MessageType {
  Question = "question",
  Answer = "answer",
}

export enum MessageRole {
  Human = "human",
  AI = "ai",
}

export interface Feedback {
  id: string
  liked: boolean
  createdAt: string
}

export interface Citation {
  id: string
  text: string
  article: string
  title: string
  section: string
  createdAt: string
}

export interface NewMessage {
  content: string
}

export interface Message {
  id: string
  content: string
  createdAt: string
  feedback: Feedback
  messageType: MessageType
  messageRole: MessageRole
  createdBy: string
  citations: Citation[]
}

export interface NewConversation {
  title: string
  initialMessage?: NewMessage
}

export interface Conversation {
  id: string
  title: string
  createdAt: string
  owner: string
}
