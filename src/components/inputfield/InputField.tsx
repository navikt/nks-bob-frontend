import { PaperplaneIcon } from "@navikt/aksel-icons"
import {
  BodyShort,
  Button,
  HStack,
  Link,
  Textarea,
  VStack,
} from "@navikt/ds-react"
import { useState } from "react"

import { NewMessage } from "../../types/Message.ts"
import "./InputField.css"

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
}

function InputField({ onSend, disabled }: InputFieldProps) {
  const placeholderText = "Spør Bob om noe"
  const [inputValue, setInputValue] = useState<string>("")

  function sendMessage() {
    const message: NewMessage = {
      content: inputValue,
    }
    onSend(message)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()
        sendMessage()
        setInputValue("")
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
    <VStack
      gap='4'
      className='dialogcontent sticky bottom-0 z-10 h-auto self-center px-4 pb-5'
      align='stretch'
    >
      <HStack gap='1' align='end' className='relative'>
        <Textarea
          size='medium'
          label=''
          hideLabel
          className='flex-grow'
          minRows={1}
          maxRows={8}
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button
          icon={<PaperplaneIcon title='Historikk' />}
          variant='tertiary'
          size='medium'
          className='input-button'
          onClick={handleButtonClick}
        />
      </HStack>
      <BodyShort size='small' align='center'>
        Bob baserer svarene på informasjonen fra{" "}
        <Link href='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html'>
          Kunnskapsbasen
        </Link>
        .
      </BodyShort>
    </VStack>
  )
}

export default InputField
