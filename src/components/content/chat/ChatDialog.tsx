import { useEffect, useRef } from "react"
import { Conversation, Message } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"

interface ChatDialogProps {
  conversationId: Conversation["id"]
  messages: Message[]
}

function ChatContainer({ messages, conversationId }: ChatDialogProps) {
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
    <div className='dialogcontent flex h-auto grow flex-col gap-8 px-4'>
      {messages.map((message) =>
        message.messageRole === "human" ? (
          <UserQuestionBubble key={message.id} userQuestion={message} />
        ) : (
          <BobAnswerBubble
            key={message.id}
            message={message}
            conversationId={conversationId}
          />
        ),
      )}
      <div ref={lastMessageRef} className='pb-18' />
    </div>
  )
}

export default ChatContainer
