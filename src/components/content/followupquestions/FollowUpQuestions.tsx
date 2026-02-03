import { BodyShort, Label } from "@navikt/ds-react"
import { memo } from "react"
import analytics from "../../../utils/analytics"
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
        <div className={`fade-in flex flex-col gap-2 overflow-hidden py-2 ${className}`}>
          <Label
            size='small'
            className=''
          >
            Forslag til oppfølgingsspørsmål
          </Label>

          <div className='flex grow flex-col gap-1'>
            {followUp.map((question, index) => (
              <button
                onClick={() => {
                  analytics.forslagTrykket()
                  onSend(question)
                }}
                key={`question-${index}`}
                className={`followupcontainer cursor-pointer truncate transition-opacity question-${index} `}
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
