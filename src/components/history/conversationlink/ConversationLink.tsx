import { useLocation } from "react-router-dom"
import { Conversation } from "../../../types/Message.ts"
import DeleteConversation from "../deleteconversation/DeleteConversation.tsx"
import "./ConversationLink.css"

interface ConversationLinkProps {
  conversation: Conversation
}

function ConversationLink({ conversation }: ConversationLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === `/samtaler/${conversation.id}`

  return (
    <a
      href={`/samtaler/${conversation.id}`}
      className={`conversationlink ${isActive ? "bg-surface-neutral-subtle font-semibold" : ""}`}
    >
      <div className="conversationtext truncate">{conversation.title}</div>
      <DeleteConversation conversation={conversation} />
    </a>
  )
}

export default ConversationLink
