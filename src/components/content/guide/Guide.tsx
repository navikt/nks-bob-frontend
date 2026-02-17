import { useEffect, useRef, useState } from "react"
import { Button, Modal, Tooltip } from "@navikt/ds-react"
import { InformationSquareIcon } from "@navikt/aksel-icons"
import { useHotkeys } from "react-hotkeys-hook"
import { useUpdateUserConfig, useUserConfig } from "../../../api/api.ts"
import { StepModal } from "./GuideModals.tsx"
import "./GuideStyling.css"
import analytics from "../../../utils/analytics.ts"

const Guide = () => {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const [step, setStep] = useState<number>(1)
  const { updateUserConfig } = useUpdateUserConfig()
  const { userConfig } = useUserConfig()

  const showGuide = () => {
    analytics.infoÅpnet()
    setIsOpen(true)
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
    setIsOpen(false)
    setStep(1)
  }

  useEffect(() => {
    if (userConfig?.showStartInfo) {
      setStep(0)
      setIsOpen(true)
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
        open={isOpen}
        onClose={handleClose}
        closeOnBackdropClick
      >
        <StepModal
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

export default Guide
