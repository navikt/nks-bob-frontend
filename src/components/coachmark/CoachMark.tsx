import { Button, Heading, VStack } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import Pulse1 from "../../assets/illustrations/CoachMarkPulse/Pulse1.svg"
import Pulse2 from "../../assets/illustrations/CoachMarkPulse/Pulse2.svg"
import Pulse3 from "../../assets/illustrations/CoachMarkPulse/Pulse3.svg"
import "./CoachMark.css"

interface CoachMarkProps {
  title: string
  buttonText: string
  children: React.ReactNode
}

export const CoachMark = ({ title, buttonText, children }: CoachMarkProps) => {
  const [isActive, setIsActive] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [currentPulse, setCurrentPulse] = useState(0)
  const pulses = [Pulse1, Pulse2, Pulse3]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPulse((prev) => (prev + 1) % pulses.length)
    }, 600)
    return () => clearInterval(interval)
  }, [pulses.length])

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
          <div className='absolute z-50 flex w-96 items-center justify-center'>
            <VStack className='modal-container w-full max-w-80' gap='4'>
              <Heading size='xsmall' level='2'>
                {title}
              </Heading>
              {children}
              <Button
                variant='primary-neutral'
                className='w-fit'
                onClick={() => setIsActive(false)}
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
