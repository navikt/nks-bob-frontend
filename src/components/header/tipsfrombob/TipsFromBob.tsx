import { InformationSquareIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useRef } from "react"
import amplitude from "../../../utils/amplitude.ts"
import "./TipsFromBob.css"
import { ButtonClickModal, FirstTimeLoginModal } from "./TipsModals.tsx"

const TipsFromBob = () => {
  const firstTimeLoginModal = useRef<HTMLDialogElement>(null)
  const buttonClickModal = useRef<HTMLDialogElement>(null)

  const showModal = () => {
    amplitude.infoÅpnet()
    buttonClickModal.current?.showModal()
  }

  return (
    <div className='flex self-center'>
      <Tooltip content='Informasjon og tips'>
        <Button
          variant='tertiary'
          size='medium'
          onClick={() => showModal()}
          icon={<InformationSquareIcon aria-hidden />}
        />
      </Tooltip>
      <FirstTimeLoginModal firstTimeLoginModal={firstTimeLoginModal} />
      <ButtonClickModal buttonClickModal={buttonClickModal} />
    </div>
  )
}

export default TipsFromBob
