import { Message } from "../../../../types/Message.ts"

import { BodyLong } from "@navikt/ds-react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

function UserQuestionBubble({ userQuestion }: UserChatBubbleProps) {
  const question = userQuestion?.content.replace(/\n/g, "<br>")

  return (
    <div className='questionbubble ml-11 w-fit max-w-prose'>
      <BodyLong>
        <Markdown rehypePlugins={[rehypeRaw]}>{question}</Markdown>
      </BodyLong>
    </div>
  )
}

export default UserQuestionBubble
