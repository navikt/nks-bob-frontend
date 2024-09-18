import { useEffect, useRef } from "react";
import { Message } from "../../types/Message.ts";
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble.tsx";
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx";

interface ChatDialogProps {
  conversationId: string;
  messages: Message[];
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({ messages }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" }); // sjekk om det kan være lurt å kjøre smooth på ny melding og instant når man henter alle
    }
  }, [messages]);

  return (
    <div className="flex w-full flex-col gap-8 pb-16 pt-28">
      {messages.map((message) =>
        message.messageRole === "human" ? (
          <UserQuestionBubble userQuestion={message} />
        ) : (
          <BobAnswerBubble answer={message} />
        ),
      )}
      <div ref={lastMessageRef} className="pb-4" />
    </div>
  );
}

export default ChatDialog;
