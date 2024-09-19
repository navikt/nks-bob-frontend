import { useEffect, useRef } from "react"

import { Message } from "../../types/Message"
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble"

interface ChatDialogProps {
  conversationId: string
  messages: Message[]
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({ messages }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }) // sjekk om det kan være lurt å kjøre smooth på ny melding og instant når man henter alle
    }
  }, [messages])

  return (
    <div className="dialogcontent flex h-auto grow flex-col gap-8">
      {messages.map((message) =>
        message.messageRole === "human" ? (
          <UserQuestionBubble key={message.id} userQuestion={message} />
        ) : (
          <BobAnswerBubble key={message.id} answer={message} />
        ),
      )}
      <div ref={lastMessageRef} className="pb-18" />
    </div>
  )
}

export default ChatDialog
