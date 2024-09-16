export type MessageType = "question" | "answer";

export type MessageRole = "human" | "ai";

export type Feedback = {
  id: string;
  liked: boolean;
  createdAt: string;
};

export type Citation = {
  id: string;
  text: string;
  article: string;
  title: string;
  section: string;
  createdAt: string;
};

export type NewMessage = {
  content: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  feedback: Feedback;
  messageType: MessageType;
  messageRole: MessageRole;
  createdBy: string;
  citations: Citation[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  owner: string;
};
