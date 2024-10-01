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

  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname === `/samtaler/${conversation.id}`

  const handleDelete = async () => {
    await deleteConversation()
    if (location.pathname === `/samtaler/${conversation.id}`) {
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
      <div onClick={handleDelete} className='deletebutton'>
        <TrashIcon
          title='Slett'
          fontSize='1.3rem'
          className='hover:accent-surface-danger-hover'
        />
      </div>
    </a>
  )
}

export default ConversationLink
