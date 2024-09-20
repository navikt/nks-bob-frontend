import { Button } from "@navikt/ds-react";
import { useDeleteConversation } from "../../api/api.ts";

interface DeleteConversationProps {
  conversationId: string;
}

function DeleteConversation({ conversationId }: DeleteConversationProps) {
  const { deleteConversation, isMutating } =
    useDeleteConversation(conversationId);

  const handleDelete = async () => {
    try {
      await deleteConversation();
      alert("Samtalen ble slettet");
    } catch (error) {
      console.error("Samtalen ble ikke slettet", error);
    }
  };

  return (
    <Button
      size="small"
      variant="tertiary-neutral"
      onClick={handleDelete}
      disabled={isMutating}
    >
      {isMutating ? "Sletter..." : "Slett"}
    </Button>
  );
}

export default DeleteConversation;
