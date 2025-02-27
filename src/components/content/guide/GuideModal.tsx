import {
  ChevronLeftDoubleIcon,
  ChevronRightDoubleIcon,
  XMarkIcon,
} from "@navikt/aksel-icons"
import { Button, Heading, HStack, VStack } from "@navikt/ds-react"
import "./GuideModals.css"
import { StepSelect } from "./StepSelect.tsx"

interface ModalContainerProps {
  children: React.ReactNode
  step?: number
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  handleSelectChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const ModalContainer = ({
  children,
  step,
  onClose,
  onNext,
  onPrevious,
  handleSelectChange,
}: ModalContainerProps) => (
  <div className='guide-modal items-center gap-4'>
    <VStack className='modal-container'>
      <HStack align='center' justify='space-between'>
        <Heading size='small' level='2'>
          Title
        </Heading>
        <Button
          size='small'
          variant='tertiary-neutral'
          icon={<XMarkIcon />}
          onClick={onClose}
        />
      </HStack>
      {children}
      <HStack align='stretch' gap='2' justify='space-between'>
        {handleSelectChange && step !== undefined && (
          <StepSelect step={step} onChange={handleSelectChange} />
        )}
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant='tertiary-neutral'
            icon={<ChevronLeftDoubleIcon />}
          >
            Forrige
          </Button>
        )}
        {onNext && (
          <Button
            onClick={onNext}
            variant='primary-neutral'
            icon={<ChevronRightDoubleIcon />}
          >
            Neste
          </Button>
        )}
      </HStack>
    </VStack>
  </div>
)
