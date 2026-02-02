import { ChatExclamationmarkIcon } from "@navikt/aksel-icons"
import { Button, Checkbox, CheckboxGroup, Modal, Textarea, Tooltip } from "@navikt/ds-react"
import { useEffect, useRef, useState } from "react"
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
  const { addFeedback, isLoading } = useAddFeedback(message.id)

  const [options, setOptions] = useState<OptionKeys[]>([])
  const [optionsDirty, setOptionsDirty] = useState<boolean>(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [comment, setComment] = useState<string | null>(null)
  const [commentDirty, setCommentDirty] = useState<boolean>(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  const resetFields = () => {
    setOptions([])
    setOptionsDirty(false)
    setComment(null)
    setCommentDirty(false)
  }

  const handleOptionChanged = (opts: OptionKeys[]) => {
    setOptions(opts)
    setOptionsDirty(true)
  }

  const optionsIsValid = options.length > 0

  useEffect(() => {
    if (optionsDirty && !optionsIsValid) {
      setOptionsError("Minst én av boksene må være huket av")
    } else {
      setOptionsError(null)
    }
  }, [optionsDirty, options])

  const handleCommentChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    setCommentDirty(true)
  }

  const commentIsValid = comment !== null && comment.trim() !== ""

  const isValidForm = optionsIsValid && commentIsValid

  useEffect(() => {
    if (commentDirty && !commentIsValid) {
      setCommentError("Vennligst beskriv feilen du opplever")
    } else {
      setCommentError(null)
    }
  }, [commentDirty, comment])

  const onSubmitHandler = async () => {
    if (!isValidForm) {
      return
    }

    const optionLabels = options.map((option) => OPTIONS[option])
    await addFeedback({
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
          data-color="neutral"
          variant="tertiary"
          size='small'
          aria-label='Meld inn feil med svaret'
          icon={<ChatExclamationmarkIcon />}
          onClick={() => modalRef.current?.showModal()} />
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
            onChange={handleOptionChanged}
            value={options}
            size='small'
            error={optionsError}
          >
            {Object.entries(OPTIONS).map(([value, label]) => (
              <Checkbox
                key={`feedback-option-${value}`}
                value={value}
                className='mb-1 first:mt-3 last:mb-4'
              >
                {label}
              </Checkbox>
            ))}
          </CheckboxGroup>
          {options.length > 0 ? (
            <Textarea
              label='Beskriv hva som er galt'
              onChange={handleCommentChanged}
              value={comment ?? ""}
              minRows={3}
              maxRows={5}
              maxLength={250}
              error={commentError}
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={!isValidForm}
            loading={isLoading}
            onClick={onSubmitHandler}
          >
            Send
          </Button>
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
  );
}
