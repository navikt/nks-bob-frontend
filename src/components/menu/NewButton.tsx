import { NotePencilIcon } from "@navikt/aksel-icons"
import { BodyShort, Button, Modal, Tooltip, VStack } from "@navikt/ds-react"
import { useRef } from "react"
import { Link } from "react-router"
import FeedbackThumbs from "../content/chat/feedback/FeedbackThumbs"

export const NewButton = ({ conversationId }: { conversationId: string }) => {
  const newConversationRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <div className='flex self-center'>
        <Tooltip content='Start ny samtale'>
          <Button
            variant='tertiary'
            size='medium'
            icon={<NotePencilIcon aria-hidden />}
            onClick={() => newConversationRef.current?.showModal()}
          />
        </Tooltip>
      </div>
      <Modal
        ref={newConversationRef}
        header={{
          heading: "Før du starter en ny samtale",
          size: "small",
        }}
        onClose={() => newConversationRef.current?.close()}
        closeOnBackdropClick={true}
        className='modal-styling'
      >
        <Modal.Body>
          <VStack gap='0' className='pt-3'>
            <BodyShort weight='semibold'>Hva synes du om samtalen?</BodyShort>
            <FeedbackThumbs conversationId={conversationId} />
          </VStack>
          <div className='flex flex-col gap-1 pt-8'>
            <BodyShort>
              Når du starter en ny samtale vil du miste innholdet fra denne.
              Ønsker du å fortsette?
            </BodyShort>
          </div>
        </Modal.Body>
        <Modal.Footer className='justify-end'>
          <Button
            variant='tertiary-neutral'
            onClick={() => newConversationRef.current?.close()}
          >
            Tilbake
          </Button>
          <Link to='/' className='w-fit'>
            <Button type='button' variant='danger' size='medium'>
              Start ny samtale
            </Button>
          </Link>
        </Modal.Footer>
      </Modal>
    </>
  )
}
