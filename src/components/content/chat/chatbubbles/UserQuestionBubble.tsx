import { Message } from "../../../../types/Message.ts"

import { BodyLong } from "@navikt/ds-react"
import Markdown from "react-markdown"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  return (
    <div className='questionbubble ml-11 w-fit max-w-prose'>
      <BodyLong>
        <Markdown>{userQuestion?.content}</Markdown>
      </BodyLong>
    </div>
  )
}

export default UserQuestionBubble
