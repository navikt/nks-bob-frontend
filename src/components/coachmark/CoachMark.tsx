import { Button, Heading, VStack } from "@navikt/ds-react"
import { useState } from "react"
import { useLocalStorage, useUpdateLocalStorage } from "../../utils/localStorage.ts"
import "./CoachMark.css"

interface CoachMarkProps {
  title: string
  buttonText: string
  children: React.ReactNode
  coachMarkKey: string
}

export const CoachMark = ({ title, buttonText, children, coachMarkKey }: CoachMarkProps) => {
  const coachMarkShown = useLocalStorage(coachMarkKey)
  const [, setCoachMarkShown] = useUpdateLocalStorage(coachMarkKey)
  const [isActive, setIsActive] = useState(!coachMarkShown)
  const [isOpen, setIsOpen] = useState(false)

  const handleButtonClick = () => {
    setCoachMarkShown(true)
    setIsActive(false)
  }

  return (
    isActive && (
      <div className='relative'>
        <CoachmarkTick onClick={() => setIsOpen(true)} />
        {isOpen && (
          <div className='fixed top-1/2 left-1/2 z-50 flex w-96 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center'>
            <VStack
              className='modal-container w-full max-w-80'
              gap='space-4'
            >
              <Heading
                size='xsmall'
                level='2'
              >
                {title}
              </Heading>
              {children}
              <Button
                data-color='neutral'
                variant='primary'
                className='w-fit'
                onClick={handleButtonClick}
              >
                {buttonText}
              </Button>
            </VStack>
          </div>
        )}
      </div>
    )
  )
}

const CoachmarkTick = ({ onClick }: { onClick: () => void }) => {
  return (
    <span
      className='relative flex size-3 cursor-pointer'
      onClick={onClick}
    >
      <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0067C5] opacity-75'></span>
      <span className='relative inline-flex size-3 rounded-full bg-[#0067C5]'></span>
    </span>
  )
}
