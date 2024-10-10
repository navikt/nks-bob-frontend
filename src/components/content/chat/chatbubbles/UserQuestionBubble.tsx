import { Message } from "../../../../types/Message.ts"

import Markdown from "react-markdown"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='questionbubble w-fit max-w-prose'>
      <Markdown>{userQuestion?.content}</Markdown>
    </div>
  )
}

export default UserQuestionBubble

// display: flex;
// padding: 16px;
// flex-direction: column;
// align-items: flex-start;
// gap: 8px;
// flex: 1 0 0;
