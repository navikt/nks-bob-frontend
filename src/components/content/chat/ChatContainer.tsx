import { useEffect, useRef } from "react"
import { Message } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"

interface ChatDialogProps {
  conversationId: string
  messages: Message[]
}

function ChatContainer({ messages }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className='dialogcontent h-auto grow flex-col px-4 pt-4'>
      {messages.map((message) =>
        message.messageRole === "human" ? (
          <>
            <div ref={lastMessageRef} />
            <UserQuestionBubble key={message.id} userQuestion={message} />
          </>
        ) : (
          <BobAnswerBubble key={message.id} message={message} />
        ),
      )}
    </div>
  )
}

export default ChatContainer
