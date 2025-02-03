import { Button, HStack, ReadMore } from "@navikt/ds-react"
import { memo, useState } from "react"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend }: FollowUpQuestionsProps) => {
    const [open, setOpen] = useState(true)

    const localQuestions = [
      "Hva er åpningstidene på lokalkontorene deres??",
      "Hvordan søker jeg om sykepenger?",
      "Hva må man gjøre for å gå fra sykepenger til AAP??",
    ]

    const questionsToShow =
      process.env.NODE_ENV === "development"
        ? followUp.concat(localQuestions)
        : followUp

    return (
      <HStack justify='space-evenly'>
        {questionsToShow.length > 0 && (
          <ReadMore
            open={open}
            onOpenChange={(isOpen) => setOpen(isOpen)}
            header='Forslag fra Bob'
            className='w-full'
          >
            {questionsToShow.map((question, index) => (
              <Button
                variant='tertiary'
                size='small'
                onClick={() => onSend(question)}
                key={`question-${index}`}
              >
                {question}
              </Button>
            ))}
          </ReadMore>
        )}
      </HStack>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.followUp === nextProps.followUp
  },
)
