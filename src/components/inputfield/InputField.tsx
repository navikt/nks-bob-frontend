import { PaperplaneIcon } from "@navikt/aksel-icons"
import {
  BodyShort,
  Button,
  HStack,
  Link,
  Textarea,
  VStack,
} from "@navikt/ds-react"
import React, { useState } from "react"

import { NewMessage } from "../../types/message"

interface InputFieldProps {
  onSend: (message: NewMessage) => void
}

function InputField({ onSend }: InputFieldProps) {
  const nksArtiklerLink =
    "https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html"
  const [inputValue, setInputValue] = useState<string>("")

  function sendMessage() {
    const message: NewMessage = {
      content: inputValue,
    }
    onSend(message)
  }

  const sendMessageAndResetInput = () => {
    if (inputValue.trim() !== "") {
      sendMessage()
      setInputValue("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()
        sendMessageAndResetInput()
      }
    }
  }

  return (
    <VStack
      gap="4"
      className="dialogcontent sticky bottom-0 z-10 bg-bg-default pb-3"
    >
      <HStack gap="2" align="end">
        <Textarea
          size="small"
          label=""
          hideLabel
          className="flex-grow"
          minRows={1}
          maxRows={10}
          placeholder="Spør Bob om noe"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          icon={<PaperplaneIcon title="Send spørsmål" />}
          variant="primary"
          size="small"
          className="h-full max-h-10"
          onClick={sendMessageAndResetInput}
        />
      </HStack>
      <BodyShort size="small" align="center" className="max-sm:hidden">
        Bob baserer svarene på informasjonen fra{" "}
        <Link href={nksArtiklerLink} target="_blank">
          nks kunnskapsartikler
        </Link>
        .
      </BodyShort>
    </VStack>
  )
}

export default InputField
