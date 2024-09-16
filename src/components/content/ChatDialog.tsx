import { VStack } from "@navikt/ds-react";
import { Message } from "../../types/Message.ts";
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx";
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble.tsx";
import {useEffect, useRef} from "react";

interface ChatDialogProps {
  conversationId: string;
  messages: Message[]
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({ messages }: ChatDialogProps) {
  const lastMessageRef = useRef <HTMLDivElement | null>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" }) // sjekk om det kan være lurt å kjøre smooth på ny melding og instant når man henter alle
    }
  }, [messages]);

  return <VStack gap="10" width="100%" >
    {
      messages.map(message => message.messageRole === "human"
          ? <UserQuestionBubble userQuestion={message} />
          : <BobAnswerBubble answer={message} />)
    }
   <div ref={lastMessageRef} className="pb-24"  />
  </VStack>;
}

export default ChatDialog;
