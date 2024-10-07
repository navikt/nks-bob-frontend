import { TrashIcon } from "@navikt/aksel-icons"
import { BodyShort } from "@navikt/ds-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDeleteConversation } from "../../../api/api.ts"
import { Conversation } from "../../../types/Message.ts"
import "./ConversationLink.css"

interface ConversationLinkProps {
  conversation: Conversation
}

function ConversationLink({ conversation }: ConversationLinkProps) {
  const { deleteConversation } = useDeleteConversation(conversation)

  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === `/samtaler/${conversation.id}`

  const handleDelete = async () => {
    await deleteConversation()
    if (isActive) {
      navigate("/")
    }
  }

  return (
    <a
      href={`/samtaler/${conversation.id}`}
      className={`conversationlink ${isActive ? "active-conversation" : ""}`}
    >
      <BodyShort truncate={true} size='medium'>
        {conversation.title}
      </BodyShort>
      <a onClick={handleDelete} className='deletebutton'>
        <TrashIcon
          title='Slett'
          fontSize='1.3rem'
          className='hover:accent-surface-danger-hover'
        />
      </a>
    </a>
  )
}

export default ConversationLink
