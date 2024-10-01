import { TrashIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useDeleteConversation } from "../../../api/api.ts"
import { Conversation } from "../../../types/Message.ts"

interface DeleteConversationProps {
  conversation: Conversation
}

function DeleteConversation({ conversation }: DeleteConversationProps) {
  const { deleteConversation, isLoading } = useDeleteConversation(conversation)
  const location = useLocation()
  const navigate = useNavigate()

  const handleDelete = async () => {
    await deleteConversation()
    if (location.pathname === `/samtaler/${conversation.id}`) {
      navigate("/")
    }
  }

  return (
    <div onClick={handleDelete} className='displaydelete'>
      {isLoading ? (
        "Sletter..."
      ) : (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<TrashIcon title='Slett' />}
        />
      )}
    </div>
  )
}

export default DeleteConversation
