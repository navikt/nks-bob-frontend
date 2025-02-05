import { Label, VStack } from "@navikt/ds-react"
import { memo } from "react"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend }: FollowUpQuestionsProps) => {
    return (
      followUp.length > 0 && (
        <VStack gap='2'>
          <Label textColor='subtle' size='small'>
            Forslag fra Bob
          </Label>
          <div className='flex w-full flex-row gap-2'>
            {followUp.map((question, index) => (
              <button
                onClick={() => onSend(question)}
                key={`question-${index}`}
                className='navds-chips__chip navds-chips__toggle navds-chips__toggle--action basis-1/3 truncate transition-all hover:basis-full'
              >
                <span className='truncate'>{question}</span>
              </button>
            ))}
          </div>
        </VStack>
      )
    )
  },
  (prevProps, nextProps) => {
    return prevProps.followUp === nextProps.followUp
  },
)
