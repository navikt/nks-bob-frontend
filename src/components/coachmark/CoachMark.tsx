import { Button, Heading, VStack } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import Pulse1 from "../../assets/illustrations/CoachMarkPulse/Pulse1.svg"
import Pulse2 from "../../assets/illustrations/CoachMarkPulse/Pulse2.svg"
import Pulse3 from "../../assets/illustrations/CoachMarkPulse/Pulse3.svg"
import {
  useLocalStorage,
  useUpdateLocalStorage,
} from "../../utils/localStorage.ts"
import "./CoachMark.css"

interface CoachMarkProps {
  title: string
  buttonText: string
  children: React.ReactNode
  coachMarkKey: string
}

export const CoachMark = ({
  title,
  buttonText,
  children,
  coachMarkKey,
}: CoachMarkProps) => {
  const coachMarkShown = useLocalStorage(coachMarkKey)
  const [, setCoachMarkShown] = useUpdateLocalStorage(coachMarkKey)
  const [isActive, setIsActive] = useState(!coachMarkShown)
  const [isOpen, setIsOpen] = useState(false)
  const [currentPulse, setCurrentPulse] = useState(0)
  const pulses = [Pulse1, Pulse2, Pulse3]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPulse((prev) => (prev + 1) % pulses.length)
    }, 600)
    return () => clearInterval(interval)
  }, [pulses.length])

  const handleButtonClick = () => {
    setCoachMarkShown(true)
    setIsActive(false)
  }

  return (
    isActive && (
      <div className='relative'>
        <div
          id='coachmark-pulse'
          className='relative cursor-pointer'
          onClick={() => setIsOpen(true)}
        >
          {pulses.map((Pulse, index) => (
            <img
              key={index}
              src={Pulse}
              alt={`Pulse ${index + 1}`}
              className={`pulse ${currentPulse === index ? "pulse-active" : ""}`}
            />
          ))}
        </div>
        {isOpen && (
          <div className='fixed left-1/2 top-1/2 z-50 flex w-96 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center'>
            <VStack className='modal-container w-full max-w-80' gap='4'>
              <Heading size='xsmall' level='2'>
                {title}
              </Heading>
              {children}
              <Button
                variant='primary-neutral'
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
