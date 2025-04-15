import { Alert, Button, Detail, Textarea } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { useEffect, useState } from "react"

import * as React from "react"
import { create } from "zustand"
import { NewMessage } from "../../types/Message.ts"
import analytics from "../../utils/analytics.ts"
import { FollowUpQuestions } from "../content/followupquestions/FollowUpQuestions.tsx"
import "./InputField.css"

type InputFieldState = {
  inputValue: string
  setInputValue: (value: string) => void
  followUp: string[]
  setFollowUp: (followUp: string[]) => void
  focusTextarea: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  setTextAreaRef: (ref: React.RefObject<HTMLTextAreaElement | null>) => void
}

export const useInputFieldStore = create<InputFieldState>()((set) => {
  const focusTextarea = () => 
    set((state) => {
      state.textareaRef?.current?.focus()
      return state
    })
  

  return {
    inputValue: "",
    setInputValue: (value) => set((state) => ({ ...state, inputValue: value })),
    followUp: [],
    setFollowUp: (followUp) => set((state) => ({ ...state, followUp })),
    focusTextarea,
    textareaRef: React.createRef(),
    setTextAreaRef: (ref) => set((state) => ({ ...state, textareaRef: ref }))
  }
})

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
}

function InputField({ onSend, disabled }: InputFieldProps) {
  const placeholderText = "Spør Bob om noe Nav-relatert"
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] =
    useState<boolean>(false)
  const [containsFnr, setContainsFnr] = useState<boolean>(false)
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)

  const { inputValue, setInputValue, followUp, textareaRef } =
    useInputFieldStore()

  function sendMessage(messageContent?: string) {
    const message: NewMessage = {
      content: messageContent ?? inputValue,
    }
    if (message.content.trim() !== "") {
      onSend(message)
    }
    setInputValue("")
    textareaRef.current?.blur()
  }

  function handlePasteInfoAlert() {
    analytics.tekstInnholdLimtInn()
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
          analytics.meldingSendt("enter")
          sendMessage()
          setInputValue("")
          setIsSensitiveInfoAlert(false)
        }
      }
    }
  }

  function handleButtonClick() {
    if (inputValue.trim() !== "") {
      analytics.meldingSendt("knapp")
      sendMessage()
      setInputValue("")
    }
  }

  useEffect(() => {
    const inputContainsFnr = checkContainsFnr(inputValue)

    if (inputContainsFnr) {
      analytics.tekstInneholderFnr()
    }

    setContainsFnr(inputContainsFnr)
    setSendDisabled(disabled || inputContainsFnr)
  }, [inputValue, disabled])

  return (
    <div className='dialogcontent z-1 sticky bottom-0 h-auto flex-col self-center px-4'>
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
      <FollowUpQuestions
        followUp={followUp}
        onSend={(question) => sendMessage(question)}
        className='pointer-events-auto'
      />
      <div className='inputfield relative flex max-w-[48rem] flex-col items-center justify-end'>
        <Textarea
          ref={textareaRef}
          size='medium'
          label=''
          hideLabel
          className='dialogcontent mb-3 truncate *:h-[43px] *:transition-[height] *:delay-150 *:duration-300 *:ease-in focus:*:h-[80px]'
          minRows={1}
          maxRows={8}
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          onPaste={handlePasteInfoAlert}
          tabIndex={0}
        />
        <Button
          icon={<PaperplaneIcon title='Send melding' />}
          variant='tertiary'
          size='medium'
          className='input-button absolute'
          onClick={handleButtonClick}
          disabled={sendDisabled}
        />
      </div>
      <Detail align='center' className='detailcolor pb-2'>
        Bob er en kunstig intelligens og kan ta feil – sjekk kilder om du er
        usikker.
      </Detail>
    </div>
  )
}

export default InputField
