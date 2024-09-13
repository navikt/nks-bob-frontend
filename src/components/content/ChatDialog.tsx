import { VStack } from "@navikt/ds-react";
import { Message } from "../../types/Message.ts";
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx";
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble.tsx";

interface ChatDialogProps {
  newMessage?: Message;
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({ newMessage }: ChatDialogProps) {
  return (
    <VStack gap="10" width="100%">
      <UserQuestionBubble userQuestion={newMessage} />
      <BobAnswerBubble />
    </VStack>
  );
}

export default ChatDialog;
