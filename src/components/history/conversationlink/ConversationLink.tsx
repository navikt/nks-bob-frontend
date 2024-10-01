import { TrashIcon } from "@navikt/aksel-icons"
import { BodyShort, Button } from "@navikt/ds-react"
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
      className={`flex px-2 text-text-default hover:bg-surface-neutral-hover ${isActive ? "bg-surface-neutral-subtle" : ""}`}
    >
      <BodyShort
        truncate={true}
        size='small'
        className='flex-grow justify-start align-middle leading-8'
      >
        {conversation.title}
      </BodyShort>
      <Button
        onClick={handleDelete}
        variant='tertiary-neutral'
        size='small'
        icon={<TrashIcon title='Slett' />}
      />
    </a>
  )
}

export default ConversationLink
