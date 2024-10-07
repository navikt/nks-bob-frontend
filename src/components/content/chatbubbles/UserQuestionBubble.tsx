import { Chat } from "@navikt/ds-react"
import { Message } from "../../../types/Message.ts"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='flex justify-end pt-8'>
      <Chat position='right'>
        <Chat.Bubble className='max-w-prose bg-blue-50'>
          {userQuestion?.content}
        </Chat.Bubble>
      </Chat>
    </div>
  )
}

export default UserQuestionBubble
