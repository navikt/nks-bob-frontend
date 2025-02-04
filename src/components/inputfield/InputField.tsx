import { Alert, BodyShort, Button, Textarea } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"

import { NewMessage } from "../../types/Message.ts"
import amplitude from "../../utils/amplitude.ts"
import { FollowUpQuestions } from "../content/followupquestions/FollowUpQuestions.tsx"
import "./InputField.css"

type InputFieldContextType = {
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  followUp: string[]
  setFollowUp: React.Dispatch<React.SetStateAction<string[]>>
}

const InputFieldContext = createContext<InputFieldContextType | undefined>(
  undefined,
)

export const useInputFieldContext = () => {
  const context = useContext(InputFieldContext)
  if (context === undefined) {
    throw new Error(
      "useInputFieldContext must be used within InputFieldContextProvider",
    )
  }

  return context
}

export const InputFieldContextProvider = ({ children }: PropsWithChildren) => {
  const [inputValue, setInputValue] = useState<string>("")
  const [followUp, setFollowUp] = useState<string[]>([])

  return (
    <InputFieldContext.Provider
      value={{
        inputValue,
        setInputValue,
        followUp,
        setFollowUp,
      }}
    >
      {children}
    </InputFieldContext.Provider>
  )
}

interface InputFieldProps {
  onSend: (message: NewMessage) => void
  disabled: boolean
}

function InputField({ onSend, disabled }: InputFieldProps) {
  const placeholderText = "Spør Bob om noe"
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] =
    useState<boolean>(false)
  const [containsFnr, setContainsFnr] = useState<boolean>(false)
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)

  const { inputValue, setInputValue, followUp } = useInputFieldContext()

  function sendMessage(messageContent?: string) {
    const message: NewMessage = {
      content: messageContent ?? inputValue,
    }
    if (message.content.trim() !== "") {
      onSend(message)
    }
    setInputValue("")
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
      <FollowUpQuestions
        followUp={followUp}
        onSend={(question) => sendMessage(question)}
      />
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
