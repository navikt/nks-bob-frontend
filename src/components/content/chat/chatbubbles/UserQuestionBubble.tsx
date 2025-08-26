import { Message } from "../../../../types/Message.ts"

import { PencilWritingIcon } from "@navikt/aksel-icons"
import { Button, Heading, Tooltip } from "@navikt/ds-react"
import { memo } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import analytics from "../../../../utils/analytics.ts"
import { useInputFieldStore } from "../../../inputfield/InputField.tsx"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

const UserQuestionBubble = memo(
  ({ userQuestion }: UserChatBubbleProps) => {
    const raw = userQuestion?.content?.trimEnd() ?? ""
    // const question = userQuestion?.content.replace(/\n/g, "<br>")

    const { setInputValue, focusTextarea } = useInputFieldStore()

    const editQuestion = () => {
      if (userQuestion) {
        focusTextarea()
        setInputValue(userQuestion.content)
        analytics.spørsmålRedigert()
      }
    }

    return (
      <div className='questionhover mb-4 flex w-fit flex-row items-end gap-1 self-end'>
        <div className='hide-show-edit fade-in hidden'>
          <Tooltip
            content='Rediger spørsmålet'
            placement='bottom'
          >
            <Button
              variant='tertiary-neutral'
              size='small'
              aria-label='Rediger spørsmålet'
              onClick={editQuestion}
              icon={<PencilWritingIcon />}
            />
          </Tooltip>
        </div>
        <div className='questionbubble max-w-prose'>
          <Heading
            size='small'
            className='sr-only top-0'
            level='2'
          >
            Du spurte:
          </Heading>
          <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
          >
            {raw}
          </Markdown>
        </div>
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
