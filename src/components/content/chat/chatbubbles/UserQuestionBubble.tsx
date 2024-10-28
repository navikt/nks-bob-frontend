import { Message } from "../../../../types/Message.ts"

import Markdown from "react-markdown"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='questionbubble ml-11 w-fit max-w-prose'>
      <Markdown>{userQuestion?.content}</Markdown>
    </div>
  )
}

export default UserQuestionBubble
