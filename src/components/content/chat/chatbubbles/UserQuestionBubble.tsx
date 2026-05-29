import { Message } from "../../../../types/Message.ts"

import { FilesIcon, PencilWritingIcon } from "@navikt/aksel-icons"
import { Button, CopyButton, Heading, Loader, Tooltip } from "@navikt/ds-react"
import { memo } from "react"
import analytics from "../../../../utils/analytics.ts"
import { OPTIMISTIC_USER_MSG_ID } from "../../../../types/messageStore.ts"
import { AppMarkdown } from "../../../../utils/AppMarkdown.tsx"
import { useInputFieldStore } from "../../../inputfield/InputField.tsx"
import "./ChatBubbles.css"

interface UserChatBubbleProps {
  userQuestion?: Message
}

const UserQuestionBubble = memo(
  ({ userQuestion }: UserChatBubbleProps) => {
    const raw = userQuestion?.content?.trimEnd() ?? ""
    const isOptimistic = userQuestion?.id === OPTIMISTIC_USER_MSG_ID

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
        {!isOptimistic && (
          <div className='hide-show-edit fade-in hidden'>
            <Tooltip
              content='Kopier teksten'
              placement='bottom'
            >
              <CopyButton
                copyText={raw}
                size='small'
                activeText='Kopiert!'
                icon={
                  <FilesIcon
                    aria-hidden
                    fontSize='1.25rem'
                  />
                }
              />
            </Tooltip>
            <Tooltip
              content='Rediger teksten'
              placement='bottom'
            >
              <Button
                data-color='neutral'
                variant='tertiary'
                size='small'
                aria-label='Rediger spørsmålet'
                onClick={editQuestion}
                icon={
                  <PencilWritingIcon
                    aria-hidden
                    fontSize='1.25rem'
                  />
                }
              />
            </Tooltip>
          </div>
        )}
        {isOptimistic && (
          <Loader
            size='small'
            title='Sender spørsmål'
            className='mr-2 self-center'
          />
        )}
        <div className='questionbubble max-w-prose'>
          <Heading
            size='small'
            className='sr-only top-0 select-none'
            level='2'
          >
            Du spurte:
          </Heading>
          <AppMarkdown
            components={{
              blockquote: ({ ...props }) => (
                <blockquote
                  {...props}
                  className='text-ax-text-brand-magenta border-l-4 pl-2'
                />
              ),
            }}
          >
            {raw}
          </AppMarkdown>
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
