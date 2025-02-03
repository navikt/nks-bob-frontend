import { Fragment, useEffect, useRef } from "react"
import { Message, NewMessage } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"

interface ChatDialogProps {
  conversationId: string
  messages: Message[]
  onSend: (message: NewMessage) => void
  isLoading: boolean
  setInputValue: React.Dispatch<React.SetStateAction<string>>
}

function ChatContainer({ messages, onSend, isLoading, setInputValue }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "instant",
      })
    }
  }, [messages])

  return (
    <div className='dialogcontent h-auto grow flex-col px-4 pt-4'>
      {messages.map((message, index) =>
        message.messageRole === "human" ? (
          <Fragment key={message.id}>
            <div ref={lastMessageRef} />
            <UserQuestionBubble
              userQuestion={message}
              setInputValue={setInputValue}
            />
          </Fragment>
        ) : (
          <BobAnswerBubble
            key={message.id}
            message={message}
            onSend={onSend}
            isLoading={isLoading}
            isLastMessage={index === messages.length - 1}
          />
        ),
      )}
    </div>
  )
}

export default ChatContainer
