import { Message } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"

interface ChatDialogProps {
  conversationId: string
  messages: Message[]
}

function ChatContainer({ messages }: ChatDialogProps) {
  return (
    <div className='dialogcontent h-auto grow flex-col gap-8 px-4 pt-8'>
      {messages.map((message) =>
        message.messageRole === "human" ? (
          <UserQuestionBubble key={message.id} userQuestion={message} />
        ) : (
          <BobAnswerBubble key={message.id} message={message} />
        ),
      )}
    </div>
  )
}

export default ChatContainer
