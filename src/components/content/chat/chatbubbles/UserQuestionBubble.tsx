import { Chat } from "@navikt/ds-react"
import { Message } from "../../../../types/Message.ts"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='flex flex-col pt-8'>
      <Chat position='right' className="max-w-full">
        <Chat.Bubble className='max-w-prose bg-blue-50'>
          {userQuestion?.content}
        </Chat.Bubble>
      </Chat>
    </div>
  )
}

export default UserQuestionBubble
