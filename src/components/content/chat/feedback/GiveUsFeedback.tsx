import { ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  Textarea,
  Tooltip,
} from "@navikt/ds-react"
import { useRef, useState } from "react"
import { useAddFeedback } from "../../../../api/api.ts"
import { Message } from "../../../../types/Message.ts"

const OPTIONS = {
  "feil-med-svar": "Hele-/deler av svaret er feil",
  "vesentlige-detaljer": "Mangler vesentlige detaljer",
  "forventede-artikler": "Benytter ikke forventede artikler",
  kontekst: "Forholder seg ikke til kontekst",
  "blander-ytelser": "Blander ytelser",
  "sitat-i-artikkelen": "Finner ikke sitatet i artikkelen",
  "mangler-kilder": "Mangler kilder",
  annet: "Annet",
}

type OptionKeys = keyof typeof OPTIONS

interface FeedbackOnAnswerProps {
  message: Message
}

export const FeedbackOnAnswer = ({ message }: FeedbackOnAnswerProps) => {
  const modalRef = useRef<HTMLDialogElement>(null)
  const { addFeedback } = useAddFeedback(message.id)

  const [options, setOptions] = useState<OptionKeys[]>([])
  const [comment, setComment] = useState<string | null>(null)

  const resetFields = () => {
    setOptions([])
    setComment(null)
  }

  const handleOptionChanged = (opts: OptionKeys[]) => {
    setOptions(opts)
  }

  const submit = () => {
    const optionLabels = options.map((option) => OPTIONS[option])
    addFeedback({
      options: optionLabels,
      comment,
    })

    resetFields()
    modalRef.current?.close()
  }

  return (
    <div>
      <Tooltip content='Meld inn feil med svaret'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Meld inn feil med svaret'
          icon={<ChatExclamationmarkIcon />}
          onClick={() => modalRef.current?.showModal()}
        />
      </Tooltip>

      <Modal
        ref={modalRef}
        header={{
          heading: "Meld feil",
          size: "small",
          icon: <ChatExclamationmarkIcon />,
        }}
        width={600}
      >
        <Modal.Body>
          <CheckboxGroup
            legend='Hva er galt med svaret?'
            description="Du kan også sende blankt svar"
            onChange={handleOptionChanged}
            value={options}
            size='small'
          >
            {Object.entries(OPTIONS).map(([value, label]) => (
              <Checkbox value={value} className='mb-1 first:mt-3 last:mb-4'>
                {label}
              </Checkbox>
            ))}
            {options.length > 0 ? (
              <Textarea
                label='Beskriv hva som er galt (valgfritt)'
                onChange={(e) => setComment(e.target.value)}
                minRows={3}
                maxRows={5}
                maxLength={250}
              />
            ) : null}
          </CheckboxGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={submit}>Send</Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => modalRef.current?.close()}
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
