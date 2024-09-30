import { Button } from "@navikt/ds-react"
import { useDeleteConversation } from "../../../api/api.ts"
import { Conversation } from "../../../types/Message.ts"

interface DeleteConversationProps {
  conversation: Conversation
}

function DeleteConversation({ conversation }: DeleteConversationProps) {
  const { deleteConversation, isLoading } = useDeleteConversation(conversation)

  function handleButtonClick() {
    deleteConversation()
  }

  return (
    <Button
      size="small"
      variant="tertiary-neutral"
      onClick={handleButtonClick}
      disabled={isLoading}
    >
      {isLoading ? "Sletter..." : "Slett"}
    </Button>
  )
}

export default DeleteConversation
