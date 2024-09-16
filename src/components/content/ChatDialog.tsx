import { VStack } from "@navikt/ds-react";
import { Message } from "../../types/Message.ts";
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx";
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble.tsx";

interface ChatDialogProps {
  conversationId: string;
  messages: Message[]
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({ messages }: ChatDialogProps) {
  return (
    <VStack gap="10" width="100%">
      {
        messages.map(message => (
          message.messageRole === "human"
            ? <UserQuestionBubble userQuestion={message} />
            : <BobAnswerBubble answer={message} />
        ))
      }
    </VStack>
  );
}

export default ChatDialog;
