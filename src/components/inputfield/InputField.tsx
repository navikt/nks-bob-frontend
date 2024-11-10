import { Alert, BodyShort, Button, Link, Textarea } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { useState } from "react"

import { NewMessage } from "../../types/Message.ts"
import { NewButton } from "../menu/Buttons.tsx"
import "./InputField.css"

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
  conversation: string | undefined
}

function InputField({ onSend, disabled, conversation }: InputFieldProps) {
  const placeholderText = "Spør Bob om noe"
  const [inputValue, setInputValue] = useState<string>("")
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] =
    useState<boolean>(false)

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
    setIsSensitiveInfoAlert(true)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
    if (e.target.value.trim() === "") {
      setIsSensitiveInfoAlert(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()
        sendMessage()
        setInputValue("")
        setIsSensitiveInfoAlert(false)
      }
    }
  }

  function handleButtonClick() {
    if (inputValue.trim() !== "") {
      sendMessage()
      setInputValue("")
    }
  }

  return (
    <div className='dialogcontent sticky bottom-0 z-10 h-auto flex-col gap-3 self-center px-4 pb-5'>
      {conversation && (
        <div className='hide-on-desktop show-on-mobile ml-[-0.6rem] pt-2'>
          <NewButton />
        </div>
      )}
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
          icon={<PaperplaneIcon title='Historikk' />}
          variant='tertiary'
          size='medium'
          className='input-button'
          onClick={handleButtonClick}
          disabled={disabled}
        />
      </div>
      <BodyShort size='small' align='center' className='hide-on-mobile'>
        Bob baserer svarene på informasjonen fra{" "}
        <Link href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'>
          Kunnskapsbasen
        </Link>
        .
      </BodyShort>
    </div>
  )
}

export default InputField
