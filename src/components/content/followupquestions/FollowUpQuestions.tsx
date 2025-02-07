import { Label } from "@navikt/ds-react"
import { memo } from "react"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
  className?: string
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend, className }: FollowUpQuestionsProps) => {
    return (
      followUp.length > 0 && (
        <div className={`flex flex-col gap-2 overflow-auto ${className}`}>
          <Label textColor='subtle' size='small'>
            Forslag fra Bob
          </Label>
          <div className='flex flex-row gap-2'>
            {followUp.map((question, index) => (
              <button
                onClick={() => onSend(question)}
                key={`question-${index}`}
                className='navds-chips__chip navds-chips__toggle navds-chips__toggle--action basis-1/3 truncate transition-all hover:basis-full'
              >
                <span className='navds-body-short--small truncate'>
                  {question}
                </span>
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
