import { NotePencilIcon } from "@navikt/aksel-icons"
import { BodyShort, Button, Modal, VStack } from "@navikt/ds-react"
import { useRef } from "react"
import { Link } from "react-router"
import FeedbackThumbs from "../content/chat/feedback/FeedbackThumbs"

export const NewButton = ({ conversationId }: { conversationId: string }) => {
  const newConversationRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button
        variant='tertiary'
        size='small'
        icon={<NotePencilIcon aria-hidden />}
        iconPosition='right'
        onClick={() => newConversationRef.current?.showModal()}
        className='max-phone:hidden'
      >
        Ny samtale
      </Button>
      <Button
        variant='tertiary'
        size='medium'
        icon={<NotePencilIcon aria-hidden />}
        iconPosition='right'
        onClick={() => newConversationRef.current?.showModal()}
        className='phone:hidden'
      ></Button>
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
          <VStack gap="0" className='pt-4'>
            <BodyShort weight="semibold">
              Fikk du svar på det du lurte på i samtalen?
            </BodyShort>
            <FeedbackThumbs conversationId={conversationId} />
          </VStack>
          <div className='flex flex-col gap-1 pt-8'>
            <BodyShort>
              Når du starter en ny samtale vil du miste innholdtet fra denne.
            </BodyShort>
            <BodyShort>Ønsker du å fortsette?</BodyShort>
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
