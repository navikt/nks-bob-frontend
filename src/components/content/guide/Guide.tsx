import { useEffect, useState } from "react"
import { useUpdateUserConfig, useUserConfig } from "../../../api/api.ts"
import { Step1, Step2, Step3, Step4, WelcomeMessage } from "./GuideModals.tsx"
import "./GuideStyling.css"

const Guide = ({
  startGuide,
  setStartGuide,
}: {
  startGuide: boolean
  setStartGuide: (value: boolean) => void
}) => {
  const [step, setStep] = useState<number>(1)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isWelcomeShown, setIsWelcomeShown] = useState<boolean>(false)
  const { updateUserConfig } = useUpdateUserConfig()
  const { userConfig } = useUserConfig()

  const handleNext = () => {
    if (!isWelcomeShown) {
      setIsWelcomeShown(true)
    } else {
      setStep((prevStep) => prevStep + 1)
    }
  }

  const handlePrevious = () => setStep((prevStep) => prevStep - 1)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setStep(Number(e.target.value))

  function handleClose() {
    updateUserConfig({
      showStartInfo: false,
    }).then(() => {
      setIsModalOpen(false)
      setStartGuide(false)
    })
  }

  useEffect(() => {
    if (userConfig?.showStartInfo) {
      setIsWelcomeShown(false)
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [userConfig])

  useEffect(() => {
    if (startGuide) {
      setIsWelcomeShown(true)
      setStep(1)
      setIsModalOpen(true)
    }
  }, [startGuide])

  if (!isModalOpen) return null

  return (
    <div>
      <div className='modal-overlay' />
      {!isWelcomeShown && (
        <WelcomeMessage onNext={handleNext} onClose={handleClose} />
      )}
      {isWelcomeShown && step === 1 && (
        <Step1
          onNext={handleNext}
          onClose={handleClose}
          step={step}
          handleSelectChange={handleSelectChange}
        />
      )}
      {isWelcomeShown && step === 2 && (
        <Step2
          onPrevious={handlePrevious}
          step={step}
          handleSelectChange={handleSelectChange}
          onClose={handleClose}
          onNext={handleNext}
        />
      )}
      {isWelcomeShown && step === 3 && (
        <Step3
          onPrevious={handlePrevious}
          step={step}
          handleSelectChange={handleSelectChange}
          onClose={handleClose}
          onNext={handleNext}
        />
      )}
      {isWelcomeShown && step === 4 && (
        <Step4
          onPrevious={handlePrevious}
          step={step}
          handleSelectChange={handleSelectChange}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default Guide
