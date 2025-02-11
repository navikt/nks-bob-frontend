import { Label } from "@navikt/ds-react"
import { memo, useRef, useState } from "react"
import { useInputFieldContext } from "../../inputfield/InputField.tsx"

interface FollowUpQuestionsProps {
  followUp: string[]
  onSend: (question: string) => void
  className?: string
}

export const FollowUpQuestions = memo(
  ({ followUp, onSend, className }: FollowUpQuestionsProps) => {
    const { inputValue, setInputValue } = useInputFieldContext()
    const originalInputValueRef = useRef(inputValue)
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    const handleMouseEnter = (question: string) => {
      originalInputValueRef.current = inputValue
      setInputValue(question)
      setHoveredButton(question)
    }

    const handleMouseLeave = () => {
      setInputValue(originalInputValueRef.current)
      setHoveredButton(null)
    }

    return (
      followUp.length > 0 && (
        <div className={`flex flex-col gap-2 overflow-auto ${className}`}>
          <Label size='small'>Forslag fra Bob</Label>
          <div className='flex flex-row gap-2'>
            {followUp.map((question, index) => (
              <button
                onClick={() => onSend(question)}
                key={`question-${index}`}
                className='navds-chips__chip navds-chips__toggle navds-chips__toggle--action basis-1/3 truncate transition-all'
                onMouseEnter={() => handleMouseEnter(question)}
                onMouseLeave={handleMouseLeave}
                disabled={hoveredButton !== null && hoveredButton !== question}
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
