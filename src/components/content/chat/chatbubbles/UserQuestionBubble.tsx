import { BodyLong } from "@navikt/ds-react"
import { Message } from "../../../../types/Message.ts"

import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='questionbubble'>
      <BodyLong className='max-w-prose break-words'>
        {userQuestion?.content}
      </BodyLong>
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
