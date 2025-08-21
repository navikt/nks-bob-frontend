import { NotePencilIcon } from "@navikt/aksel-icons"
import { BodyShort, Button, Modal, Tooltip, VStack } from "@navikt/ds-react"
import { useCallback, useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate } from "react-router"
import FeedbackThumbs from "../content/chat/feedback/FeedbackThumbs"
import { useInputFieldStore } from "../inputfield/InputField"

export const NewButton = ({
  conversationId,
  newConversationRef,
}: {
  conversationId: string
  newConversationRef: React.RefObject<HTMLDialogElement | null>
}) => {
  const { setInputValue } = useInputFieldStore()
  const navigate = useNavigate()
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null)

  const openModal = useCallback(() => {
    if (!newConversationRef.current) return
    newConversationRef.current.showModal()
    requestAnimationFrame(() => primaryBtnRef.current?.focus())
  }, [newConversationRef])

  useHotkeys("Alt+Ctrl+N", openModal)

  const startNew = () => {
    setInputValue("")
    navigate("/")
  }

  return (
    <>
      <div className='flex self-center'>
        <Tooltip content='Start ny samtale ( Alt+Ctrl+N )'>
          <Button
            variant='tertiary'
            size='medium'
            icon={<NotePencilIcon aria-hidden />}
            onClick={openModal}
          />
        </Tooltip>
      </div>
      <Modal
        ref={newConversationRef}
        header={{
          heading: "Før du går videre",
          size: "small",
          closeButton: false,
        }}
        onClose={() => newConversationRef.current?.close()}
        closeOnBackdropClick
        className='modal-styling'
      >
        <Modal.Body>
          <VStack
            gap='0'
            className='pt-3'
          >
            <BodyShort weight='semibold'>Hva synes du om samtalen?</BodyShort>
            <FeedbackThumbs conversationId={conversationId} />
          </VStack>
          <div className='flex flex-col pt-4'>
            <BodyShort>Når du starter en ny samtale vil du miste innholdet fra denne. Ønsker du å fortsette?</BodyShort>
          </div>
        </Modal.Body>
        <Modal.Footer className='justify-end'>
          <Button
            ref={primaryBtnRef}
            type='button'
            variant='danger'
            size='medium'
            onClick={startNew}
            aria-label='Start ny samtale'
          >
            Start ny samtale
          </Button>
          <Button
            variant='tertiary-neutral'
            onClick={() => newConversationRef.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
