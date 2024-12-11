import { ArrowLeftIcon, ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react"
import { useRef } from "react"
import Markdown from "react-markdown"
import { Message } from "../../../../types/Message.ts"
import amplitude from "../../../../utils/amplitude.ts"

interface GiveUsFeedbackProps {
  message: Message
}

export const GiveUsFeedback = ({ message }: GiveUsFeedbackProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  function encodedText(text: string) {
    return encodeURIComponent(text).replace(
      /[-!'()*#]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    )
  }

  function handleButtonClick() {
    amplitude.feilMeldt(message.id)
    window.open(
      `https://forms.office.com/Pages/ResponsePage.aspx?id=NGU2YsMeYkmIaZtVNSedCyBQAauBOz1OlySa0dtLBP9UNUZJQkJYVzhKWTZXS0g0V0RBM0JSN1pNMC4u&rc0fd63ffeb9146e1bec0b90cc73ca985=${encodedText(message.content)}%0A%0AMeldingsID: ${encodedText(message.id)}`,
      "_blank",
    )
  }

  return (
    <div>
      <Button
        variant='tertiary-neutral'
        size='small'
        title='Meld fra om feil svar'
        icon={<ChatExclamationmarkIcon />}
        onClick={handleButtonClick}
      >
        Meld feil
      </Button>
      <Modal
        ref={ref}
        closeOnBackdropClick={true}
        aria-label='Gi oss tilbakemelding'
        header={{ closeButton: true, heading: "" }}
      >
        <Modal.Body>
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