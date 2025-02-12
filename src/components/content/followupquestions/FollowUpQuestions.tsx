import { Label } from "@navikt/ds-react"
import { memo, useRef, useState } from "react"
import { useInputFieldContext } from "../../inputfield/InputField.tsx"
import "./FollowUpQuestions.css"

interface FollowUpQuestionsProps {
  followUp: string[]
  className?: string
}

export const FollowUpQuestions = memo(
  ({ followUp, className }: FollowUpQuestionsProps) => {
    const { inputValue, setInputValue, focusTextarea } = useInputFieldContext()
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

    const handleClick = (question: string) => {
      setInputValue(question)
      originalInputValueRef.current = question
      focusTextarea()
    }

    return (
      followUp.length > 0 && (
        <div className={`flex flex-col gap-2 overflow-auto ${className}`}>
          <Label size='small'>Forslag fra Bob</Label>
          <div className='flex flex-row gap-2'>
            {followUp.map((question, index) => (
              <button
                onClick={() => handleClick(question)}
                key={`question-${index}`}
                className='followup-button basis-1/3 truncate transition-all'
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
