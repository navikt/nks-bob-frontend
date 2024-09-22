import { useEffect, useRef } from "react"

import { Message, MessageRole } from "../../types/message"
import BobAnswerBubble from "./chatbubbles/BobAnswerBubble"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble"

interface ChatDialogProps {
  conversationId: string
  messages: Message[]
}

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
    <div className="dialogcontent h-auto grow flex-col gap-8">
      {messages.map((message) =>
        message.messageRole === MessageRole.Human ? (
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
