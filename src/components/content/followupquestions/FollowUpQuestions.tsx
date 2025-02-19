import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons"
import { BodyShort, HStack, Label } from "@navikt/ds-react"
import { memo, useState } from "react"
import "./FollowUpQuestions.css"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
  className?: string
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend, className }: FollowUpQuestionsProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => {
      setIsOpen(!isOpen)
    }

    const includesDu = followUp.some((question) => question.includes("du"))

    return (
      followUp.length > 0 &&
      !includesDu && (
        <div
          className={`fade-in flex flex-col gap-2 overflow-hidden py-2 ${className}`}
        >
          <HStack
            onClick={toggleOpen}
            className='utdrag-dropdown gap-x-0.5'
            align='stretch'
          >
            <Label size='small'>Forslag fra Bob</Label>
            {isOpen ? (
              <ChevronUpIcon className='dropdownchevronup' />
            ) : (
              <ChevronDownIcon className='dropdownchevrondown' />
            )}
          </HStack>
          {!isOpen && (
            <div className='flex grow flex-col gap-1'>
              {followUp.map((question, index) => (
                <button
                  onClick={() => onSend(question)}
                  key={`question-${index}`}
                  className={`followupchip truncate transition-all question-${index} `}
                >
                  <BodyShort
                    size='small'
                    align='start'
                    className='question-text truncate'
                  >
                    {question}
                  </BodyShort>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    )
  },
  (prevProps, nextProps) => {
    return prevProps.followUp === nextProps.followUp
  },
)
