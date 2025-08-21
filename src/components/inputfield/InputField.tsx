import { Alert, Button, Detail, Textarea } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { forwardRef, useEffect, useState } from "react"

import * as React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAlerts } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import analytics from "../../utils/analytics.ts"
import "./InputField.css"

type InputFieldState = {
  inputValue: string
  setInputValue: (value: string) => void
  setFollowUp: (followUp: string[]) => void
  focusTextarea: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  setTextAreaRef: (ref: React.RefObject<HTMLTextAreaElement | null>) => void
}

export const useInputFieldStore = create<InputFieldState>()(
  persist(
    (set) => {
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
        setTextAreaRef: (ref) => set((state) => ({ ...state, textareaRef: ref })),
      }
    },
    {
      name: "input-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ inputValue: state.inputValue }),
    },
  ),
)

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
}

const InputField = forwardRef<HTMLDivElement, InputFieldProps>(function InputField({ onSend, disabled }, containerRef) {
  const placeholderText = "Spør Bob om noe Nav-relatert"
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] = useState<boolean>(false)
  const [containsFnr, setContainsFnr] = useState<boolean>(false)
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)
  const [isFocused, setIsFocused] = useState(false)

  const { inputValue, setInputValue, textareaRef } = useInputFieldStore()

  const { alerts } = useAlerts()
  const hasErrors = alerts.at(0)?.notificationType === "Error"

  function sendMessage(messageContent?: string) {
    if (sendDisabled) {
      return
    }

    const message: NewMessage = {
      content: messageContent ?? inputValue,
    }
    if (message.content.trim() !== "") {
      onSend(message)
    }
    setInputValue("")
    textareaRef.current?.blur()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text/plain")
    const trimmedText = pastedText.trim()
    setInputValue(trimmedText)
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
    setSendDisabled(disabled || inputContainsFnr || hasErrors)
  }, [inputValue, disabled, hasErrors])

  useHotkeys("alt+ctrl+o", () => sendMessage("Oversett til engelsk"))
  useHotkeys("alt+ctrl+p", () => sendMessage("Gjør om svaret til punktliste"))
  useHotkeys("alt+ctrl+l", () => sendMessage("Gjør svaret mer empatisk"))

  return (
    <div
      className='dialogcontent sticky bottom-0 h-auto flex-col self-center px-4'
      ref={containerRef}
    >
      {isSensitiveInfoAlert && (
        <Alert
          variant='info'
          size='small'
          closeButton={true}
          onClose={() => setIsSensitiveInfoAlert(false)}
          className='fade-in mb-2'
        >
          Pass på å ikke dele personopplysninger når du limer inn tekst.
        </Alert>
      )}
      {containsFnr && (
        <Alert
          variant='error'
          size='small'
          onClose={() => setContainsFnr(false)}
          className='fade-in mb-2'
        >
          Du har skrevet inn noe som ligner på et fødselsnummer. Derfor får du ikke sendt meldingen.
        </Alert>
      )}
      <div className='inputfield relative flex max-w-[48rem] flex-col items-center justify-end'>
        <Textarea
          resize={isFocused ? "vertical" : false}
          ref={textareaRef}
          size='medium'
          label=''
          hideLabel
          className='dialogcontent mb-3 min-h-[43px] truncate [&_textarea]:max-h-[450px] [&_textarea]:min-h-[43px] focus:[&_textarea]:min-h-[50px]'
          minRows={1}
          maxRows={15}
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          tabIndex={0}
          onFocus={() => {
            setIsFocused(true)
          }}
          onBlur={() => {
            setIsFocused(false)

            const ta = textareaRef.current

            if (ta) {
              ta.style.height = ""
              ta.style.width = ""
            }
          }}
        />
        <Button
          icon={<PaperplaneIcon title='Send melding' />}
          variant='tertiary'
          size='medium'
          className='absolute right-[0.2%] top-[2%] h-full max-h-[2.5rem] w-full max-w-[2.3rem]'
          onClick={handleButtonClick}
          disabled={sendDisabled}
        />
      </div>
      <Detail
        align='center'
        className='detailcolor pb-2'
      >
        Bob er en kunstig intelligens og kan ta feil – sjekk kilder om du er usikker.
      </Detail>
    </div>
  )
})

export default InputField
