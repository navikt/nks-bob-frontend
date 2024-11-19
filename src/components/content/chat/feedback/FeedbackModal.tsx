import { ArrowLeftIcon, ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react"
import { useRef } from "react"
import Markdown from "react-markdown"
import { Message } from "../../../../types/Message.ts"

interface GiveUsFeedbackProps {
  message: Message
}

export const GiveUsFeedback = ({ message }: GiveUsFeedbackProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <div>
      <Button
        onClick={() => ref.current?.showModal()}
        variant='tertiary-neutral'
        size='small'
        title='Meld fra om feil svar'
        icon={<ChatExclamationmarkIcon />}
      />
      <Modal
        ref={ref}
        closeOnBackdropClick={true}
        aria-label='Gi oss tilbakemelding'
        header={{ closeButton: true, heading: "" }}
      >
        <Modal.Body>
          <iframe
            width='720px'
            height='480px'
            src='https://forms.office.com/Pages/ResponsePage.aspx?id=NGU2YsMeYkmIaZtVNSedCyBQAauBOz1OlySa0dtLBP9UNUZJQkJYVzhKWTZXS0g0V0RBM0JSN1pNMC4u&embed=true'
            className='max-h-full max-w-full border-b-2 border-border-divider'
            allowFullScreen
          ></iframe>
          <div className='my-4'>
            <Heading size='xsmall' spacing>
              Svaret det gjelder
            </Heading>
            <div className='max-h-24 overflow-auto'>
              <BodyLong>
                <Markdown className='markdown'>{message.content}</Markdown>
              </BodyLong>
            </div>
          </div>
          <div className='flex grow justify-start'>
            <Button
              size='small'
              variant='tertiary-neutral'
              onClick={() => ref.current?.close()}
              icon={<ArrowLeftIcon />}
            >
              Tilbake
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}