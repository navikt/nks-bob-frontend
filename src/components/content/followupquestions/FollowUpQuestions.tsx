import { BodyShort, Label } from "@navikt/ds-react"
import { memo } from "react"
import "./FollowUpQuestions.css"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
  className?: string
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend, className }: FollowUpQuestionsProps) => {
    const includesDu = followUp.some((question) => question.includes("du"))

    return (
      followUp.length > 0 &&
      !includesDu && (
        <div
          className={`fade-in flex flex-col gap-2 overflow-hidden py-2 ${className}`}
        >
          <Label size='small'>Forslag fra Bob</Label>
          <div className='flex flex-col gap-1'>
            {followUp.map((question, index) => (
              <button
                onClick={() => onSend(question)}
                key={`question-${index}`}
                className={`followupchip truncate transition-all question-${index} w-fit`}
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
        </div>
      )
    )
  },
  (prevProps, nextProps) => {
    return prevProps.followUp === nextProps.followUp
  },
)
