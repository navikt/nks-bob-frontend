import { TrashIcon } from "@navikt/aksel-icons"
import { BodyShort } from "@navikt/ds-react"
import { useLocation, useNavigate } from "react-router"
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
    <div
      className={`${isActive ? "active-conversation" : ""} conversationlink cursor-pointer`}
    >
      <div
        onClick={() => navigate(`/samtaler/${conversation.id}`)}
        className='p flex w-full flex-grow px-2 py-1.5'
      >
        {/*padding: 6px 8px;*/}
        <BodyShort truncate={true} size='medium' className='w-full'>
          {conversation.title}
        </BodyShort>
      </div>
      <div onClick={handleDelete} className='deletebutton'>
        <TrashIcon
          title='Slett'
          fontSize='1.2rem'
          className='hover:accent-surface-danger-hover'
        />
      </div>
    </div>
  )
}

export default ConversationLink
