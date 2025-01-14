import { Alert, BodyShort, Button, Textarea } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { useEffect, useState } from "react"

import { NewMessage } from "../../types/Message.ts"
import amplitude from "../../utils/amplitude.ts"
import "./InputField.css"

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
}

function InputField({ onSend, disabled }: InputFieldProps) {
  const placeholderText = "Spør Bob om noe"
  const [inputValue, setInputValue] = useState<string>("")
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] =
    useState<boolean>(false)
  const [containsFnr, setContainsFnr] = useState<boolean>(false)
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)

  function sendMessage() {
    const message: NewMessage = {
      content: inputValue,
    }
    if (inputValue.trim() !== "") {
      onSend(message)
    } else {
      setInputValue("")
    }
  }

  function handlePasteInfoAlert() {
    amplitude.tekstInnholdLimtInn()
    setIsSensitiveInfoAlert(true)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
    if (e.target.value.trim() === "") {
      setIsSensitiveInfoAlert(false)
    }
  }

  function checkContainsFnr(value: string) {
    return /(\d{6}(|.)\d{5})/.test(value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()

        if (!sendDisabled) {
          amplitude.meldingSendt("enter")
          sendMessage()
          setInputValue("")
          setIsSensitiveInfoAlert(false)
        }
      }
    }
  }

  function handleButtonClick() {
    if (inputValue.trim() !== "") {
      amplitude.meldingSendt("knapp")
      sendMessage()
      setInputValue("")
    }
  }

  useEffect(() => {
    const inputContainsFnr = checkContainsFnr(inputValue)

    if (inputContainsFnr) {
      amplitude.tekstInneholderFnr()
    }

    setContainsFnr(inputContainsFnr)
    setSendDisabled(disabled || inputContainsFnr)
  }, [inputValue, disabled])

  return (
    <div className='dialogcontent inputfield sticky bottom-0 z-10 h-auto flex-col gap-3 self-center px-4 pb-5'>
      {isSensitiveInfoAlert && (
        <Alert
          variant='info'
          size='small'
          closeButton={true}
          onClose={() => setIsSensitiveInfoAlert(false)}
          className='fade-in'
        >
          Pass på å ikke dele sensitiv personinformasjon.
        </Alert>
      )}
      {containsFnr && (
        <Alert
          variant='error'
          size='small'
          onClose={() => setContainsFnr(false)}
          className='fade-in'
        >
          Pass på å ikke dele sensitiv personinformasjon.
        </Alert>
      )}
      <div className='relative flex items-center'>
        <Textarea
          size='medium'
          label=''
          hideLabel
          className='dialogcontent'
          minRows={1}
          maxRows={8}
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          onPaste={handlePasteInfoAlert}
        />
        <Button
          icon={<PaperplaneIcon title='Send melding' />}
          variant='tertiary'
          size='medium'
          className='input-button'
          onClick={handleButtonClick}
          disabled={sendDisabled}
        />
      </div>
      <BodyShort size='small' align='center'>
        Bob er en kunstig intelligens og kan ta feil – sjekk kilder for å være
        sikker.
      </BodyShort>
    </div>
  )
}

export default InputField
