import { Message } from "../../../../types/Message.ts"

import { memo } from "react"
import { BodyLong, Button } from "@navikt/ds-react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import "./ChatBubbles.css"
import { PencilIcon } from "@navikt/aksel-icons"

interface UserChatBubbleProps {
  userQuestion?: Message
  setInputValue: React.Dispatch<React.SetStateAction<string>>
}

const UserQuestionBubble = memo(({ userQuestion, setInputValue }: UserChatBubbleProps) => {
  const question = userQuestion?.content.replace(/\n/g, "<br>")

  const editQuestion = () => {
    if (userQuestion) {
      setInputValue(userQuestion.content)
    }
  }

  return (
    <div className="self-end w-fit flex flex-row justify-end gap-2 mb-[20px]">
      <div className="flex flex-col justify-center align-center">
        <Button
          variant="tertiary-neutral"
          title="Rediger spørsmål"
          onClick={editQuestion}
        >
          <PencilIcon />
        </Button>
      </div>
      <div className='questionbubble max-w-prose'>
        <BodyLong>
          <Markdown rehypePlugins={[rehypeRaw]}>{question}</Markdown>
        </BodyLong>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  const prevMessage = prevProps.userQuestion
  const nextMessage = nextProps.userQuestion

  if (!prevMessage?.pending) {
    return true
  }

  return prevMessage === nextMessage
})

export default UserQuestionBubble
