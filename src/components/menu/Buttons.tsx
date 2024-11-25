import { NotePencilIcon } from "@navikt/aksel-icons"
import { BodyShort, Button, Modal } from "@navikt/ds-react"
import { useRef } from "react"
import { Link } from "react-router"

export const NewButton = () => {
  const newConversationRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button
        variant='tertiary'
        size='small'
        icon={<NotePencilIcon aria-hidden />}
        iconPosition='right'
        onClick={() => newConversationRef.current?.showModal()}
      >
        Ny samtale
      </Button>
      <Modal
        ref={newConversationRef}
        header={{
          heading: "Du er på vei til å starte en ny samtale",
          size: "small",
        }}
        onClose={() => newConversationRef.current?.close()}
        closeOnBackdropClick={true}
        className='modal-styling'
      >
        <Modal.Body>
          <div className='flex flex-col gap-8 pb-2 pt-4'>
            <BodyShort>
              Dette vil føre til at du mister alt innholdet fra denne samtalen.
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
