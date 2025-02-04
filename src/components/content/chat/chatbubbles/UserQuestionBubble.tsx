import { Message } from "../../../../types/Message.ts"

import { PencilWritingIcon } from "@navikt/aksel-icons"
import { BodyLong, Button, Tooltip } from "@navikt/ds-react"
import { memo } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { useInputFieldContext } from "../../../inputfield/InputField.tsx"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

const UserQuestionBubble = memo(
  ({ userQuestion }: UserChatBubbleProps) => {
    const question = userQuestion?.content.replace(/\n/g, "<br>")

    const { setInputValue } = useInputFieldContext()

    const editQuestion = () => {
      if (userQuestion) {
        setInputValue(userQuestion.content)
      }
    }

    return (
      <div className='mb-[20px] flex w-fit flex-row items-end gap-2 self-end'>
        <div className='questionbubble max-w-prose'>
          <BodyLong>
            <Markdown rehypePlugins={[rehypeRaw]}>{question}</Markdown>
          </BodyLong>
        </div>
        <Tooltip content='Rediger spørsmålet' placement='right'>
          <Button
            variant='tertiary-neutral'
            size='small'
            aria-label='Rediger spørsmålet'
            onClick={editQuestion}
            icon={<PencilWritingIcon />}
            className='mb-[-0.45rem]'
          />
        </Tooltip>
      </div>
    )
  },
  (prevProps, nextProps) => {
    const prevMessage = prevProps.userQuestion
    const nextMessage = nextProps.userQuestion

    if (!prevMessage?.pending) {
      return true
    }

    return prevMessage === nextMessage
  },
)

export default UserQuestionBubble
