import { useEffect, useRef, useState } from "react"
import { Button, Modal, Tooltip } from "@navikt/ds-react"
import { InformationSquareIcon } from "@navikt/aksel-icons"
import { useHotkeys } from "react-hotkeys-hook"
import { useUpdateUserConfig, useUserConfig } from "../../../api/api.ts"
import { StepModalContent } from "./GuideModals.tsx"
import "./GuideStyling.css"
import analytics from "../../../utils/analytics.ts"
import { BobTheGuide1, BobTheGuide2, BobThePirate } from "../../../assets/illustrations/BobTheGuide.tsx"

const Guide = () => {
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [step, setStep] = useState<number>(1)
  const { updateUserConfig } = useUpdateUserConfig()
  const { userConfig } = useUserConfig()

  const showGuide = () => {
    analytics.infoÅpnet()
    modalRef.current?.showModal()
  }

  useHotkeys("Alt+Ctrl+I", () => showGuide(), {
    enableOnFormTags: true,
  })

  const handleNext = () => setStep((prevStep) => prevStep + 1)
  const handlePrevious = () => setStep((prevStep) => prevStep - 1)
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => setStep(Number(e.target.value))

  function handleClose() {
    if (userConfig?.showStartInfo) {
      updateUserConfig({ showStartInfo: false })
    }
    setStep(1)
    modalRef.current?.close()
  }

  useEffect(() => {
    if (userConfig?.showStartInfo) {
      setStep(0)
      modalRef.current?.showModal()
      analytics.infoÅpnet()
    }
  }, [userConfig])

  return (
    <>
      <Tooltip content='Informasjon og tips ( Alt+Ctrl+I )'>
        <Button
          data-color='neutral'
          variant='tertiary'
          aria-label='Informasjon og tips'
          size='medium'
          onClick={showGuide}
          icon={<InformationSquareIcon aria-hidden />}
        />
      </Tooltip>
      <Modal
        ref={modalRef}
        aria-labelledby='modal-heading'
        onClose={handleClose}
        closeOnBackdropClick
        className='relative overflow-visible'
      >
        <BobGuide step={step} />
        <StepModalContent
          step={step}
          totalSteps={5}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onClose={handleClose}
          handleSelectChange={handleSelectChange}
        />
      </Modal>
    </>
  )
}

const BobGuide = ({ step }: { step: number }) => {
  if (step === 0) {
    return (
      <div className='absolute bottom-0 -translate-x-45'>
        <BobTheGuide1 />
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className='absolute -translate-x-45'>
        <BobTheGuide1 />
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className='absolute -translate-y-44'>
        <BobTheGuide2 />
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className='absolute right-1/3 -translate-y-33'>
        <BobTheGuide2 clipHeight={172} />
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className='absolute right-0 -translate-y-52'>
        <BobThePirate clipHeight={272} />
      </div>
    )
  }

  if (step === 5) {
    return (
      <div className='absolute -translate-y-44'>
        <BobTheGuide2 />
      </div>
    )
  }

  return <></>
}

export default Guide
