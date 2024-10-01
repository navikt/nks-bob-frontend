import { TrashIcon } from "@navikt/aksel-icons"
import { BodyShort } from "@navikt/ds-react"
import { Link, useLocation } from "react-router-dom"
import { useDeleteConversation } from "../../../api/api.ts"
import { Conversation } from "../../../types/Message.ts"
import "./ConversationLink.css"

interface ConversationLinkProps {
  conversation: Conversation
}

function ConversationLink({ conversation }: ConversationLinkProps) {
  const { deleteConversation } = useDeleteConversation(conversation)

  const location = useLocation()
  const isActive = location.pathname === `/samtaler/${conversation.id}`

  const handleDelete = async () => {
    await deleteConversation()
  }

  return (
    <a
      href={`/samtaler/${conversation.id}`}
      className={`conversationlink ${isActive ? "active-conversation" : ""}`}
    >
      <BodyShort truncate={true} size='medium'>
        {conversation.title}
      </BodyShort>
      <Link to='/' onClick={handleDelete} className='deletebutton'>
        <TrashIcon
          title='Slett'
          fontSize='1.3rem'
          className='hover:accent-surface-danger-hover'
        />
      </Link>
    </a>
  )
}

export default ConversationLink
