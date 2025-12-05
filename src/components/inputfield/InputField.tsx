import { Alert, BodyShort, Button, Detail, Heading, HStack, Link, List, Textarea, VStack } from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { forwardRef, useEffect, useRef, useState } from "react"

import * as React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate, useParams } from "react-router"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAlerts } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import analytics from "../../utils/analytics.ts"
import "./InputField.css"
import {
  isError,
  isNotOk,
  isWarning,
  validatePersonnummer,
  validateName,
  validateTlf,
  ValidationError,
  ValidationWarning,
  Validator,
  validateEmail,
} from "../../utils/inputValidation.ts"

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
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)
  const [isFocused, setIsFocused] = useState(false)

  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [ignoredValidations, setIgnoredValidations] = useState<string[]>([])

  const { conversationId } = useParams()

  const { inputValue, setInputValue, textareaRef } = useInputFieldStore()

  const { alerts } = useAlerts()
  const hasAlertErrors = alerts.at(0)?.notificationType === "Error"

  function sendMessage(
    trigger: "knapp" | "enter" | "hotkey",
    messageContent?: string,
    opts: { clear?: boolean; blur?: boolean } = {},
  ) {
    const { clear = true, blur = true } = opts
    if (sendDisabled) {
      return
    }

    if (validateInput().length > 0) {
      return
    }

    const message: NewMessage = { content: messageContent ?? inputValue }
    if (message.content.trim() !== "") {
      onSend(message)
    }

    if (clear) {
      setInputValue("")
    }

    if (blur) {
      textareaRef.current?.blur()
    }

    analytics.meldingSendt(trigger)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
    if (e.target.value.trim() === "") {
      setIsSensitiveInfoAlert(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text")
    if (pasted.trim().length > 0) {
      setIsSensitiveInfoAlert(true)
      e.preventDefault()
    }
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault()

        if (!sendDisabled) {
          sendMessage("enter")
          setIsSensitiveInfoAlert(false)
        }
      }
    }
  }

  function handleButtonClick() {
    if (inputValue.trim() !== "") {
      sendMessage("knapp")
    }
  }

  const validators: Validator[] = [validatePersonnummer, validateName, validateTlf, validateEmail]

  function validateInput(ignoredWarnings?: string[]) {
    if (ignoredWarnings) {
      setIgnoredValidations(ignoredWarnings)
    } else {
      ignoredWarnings = ignoredValidations
    }

    const validationResults = validators.map((validator) => validator.call(null, inputValue)).filter(isNotOk)

    const warnings = validationResults
      .filter(isWarning)
      .flatMap((validation) => ({
        ...validation,
        matches: validation.matches.filter((match) => !ignoredWarnings.some((v) => v === match.value)),
      }))
      .filter((validation) => validation.matches.length > 0)

    setValidationWarnings(warnings)

    const errors = validationResults.filter(isError)
    setValidationErrors(errors)

    const containsFnr = validationResults.filter(isError).some((v) => v.validationType === "fnr")
    if (containsFnr) {
      analytics.tekstInneholderFnr()
    }

    warnings.forEach(({ validationType }) => analytics.valideringsfeil("warning", validationType))
    errors.forEach(({ validationType }) => analytics.valideringsfeil("error", validationType))

    return [...warnings, ...errors]
  }

  useEffect(() => {
    const validationError = validationErrors.length > 0
    const validationWarning = validationWarnings.length > 0

    if (validationError || validationWarning) {
      validateInput()
    }

    setSendDisabled(disabled || validationError || hasAlertErrors)
  }, [inputValue, disabled, hasAlertErrors])

  useHotkeys("Alt+Ctrl+O", () => sendMessage("hotkey", "Oversett til engelsk", { clear: false, blur: false }), {
    enabled: !!conversationId,
    enableOnFormTags: true,
  })
  useHotkeys(
    "Alt+Ctrl+P",
    () => sendMessage("hotkey", "Gjør om svaret til punktliste", { clear: false, blur: false }),
    {
      enabled: !!conversationId,
      enableOnFormTags: true,
    },
  )
  useHotkeys("Alt+Ctrl+E", () => sendMessage("hotkey", "Gjør svaret mer empatisk", { clear: false, blur: false }), {
    enabled: !!conversationId,
    enableOnFormTags: true,
  })

  return (
    <div
      className='dialogcontent sticky bottom-0 h-auto flex-col self-center px-4'
      ref={containerRef}
    >
      {isSensitiveInfoAlert && (
        <Alert
          variant='warning'
          size='small'
          closeButton={true}
          onClose={() => setIsSensitiveInfoAlert(false)}
          className='fade-in mb-2'
        >
          <Heading
            size='xsmall'
            spacing
          >
            Vi har midlertidig slått av muligheten for å lime inn tekst
          </Heading>
          <BodyShort spacing>
            Årsaken er at det ved flere anledninger har blitt delt personopplysninger ved innliming.
          </BodyShort>
          <BodyShort>Vi jobber aktivt med å finne en løsning.</BodyShort>
        </Alert>
      )}
      {validationWarnings.length > 0 && (
        <Alert
          variant='warning'
          size='small'
          className='fade-in mb-2'
        >
          <BodyShort
            size='small'
            spacing
          >
            Det ser ut som spørsmålet inneholder personopplysninger. Kontroller den markerte teksten før du sender.
          </BodyShort>
          <List
            size='small'
            className='max-h-36 overflow-scroll'
          >
            {validationWarnings.flatMap(({ matches }, i) =>
              matches.map(({ value, start, end }, j) => (
                <List.Item
                  key={`warning-list-${i}-${j}`}
                  className='items-center'
                >
                  <HStack
                    gap='2'
                    align='center'
                  >
                    <span className='font-bold'>{value}</span>
                    <Button
                      variant='tertiary-neutral'
                      size='small'
                      onClick={() => {
                        validateInput([...ignoredValidations, value])
                      }}
                    >
                      Ignorer
                    </Button>
                    <Button
                      variant='tertiary-neutral'
                      size='small'
                      onClick={() => {
                        if (textareaRef.current) {
                          scrollToSelection(textareaRef.current, start, end)
                        }
                      }}
                    >
                      Endre
                    </Button>
                  </HStack>
                </List.Item>
              )),
            )}
          </List>
          <Link href='#'>Hvilke opplysninger skal man ikke sende til Bob?</Link>
        </Alert>
      )}
      {validationErrors.length > 0 && (
        <Alert
          variant='error'
          size='small'
          className='fade-in mb-2'
        >
          <BodyShort
            size='small'
            spacing
          >
            Teksten ser ut til å inneholde personopplysninger. Du må fjerne eller anonymisere det som er markert før du
          </BodyShort>
          <List
            size='small'
            className='max-h-36 overflow-scroll'
          >
            {validationErrors.flatMap(({ matches }, i) =>
              matches.map(({ value, start, end }, j) => (
                <List.Item
                  key={`error-list-${i}-${j}`}
                  className='items-center'
                >
                  <HStack
                    gap='2'
                    align='center'
                  >
                    <span className='font-bold'>{value}</span>
                    <Button
                      variant='tertiary-neutral'
                      size='small'
                      onClick={() => {
                        if (textareaRef.current) {
                          scrollToSelection(textareaRef.current, start, end)
                        }
                      }}
                    >
                      Endre
                    </Button>
                  </HStack>
                </List.Item>
              )),
            )}
          </List>
          <Link href='#'>Hvilke opplysninger skal man ikke sende til Bob?</Link>
        </Alert>
      )}
      <NewMessageAlert
        setInputValue={setInputValue}
        conversationId={conversationId}
      />
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
          autoFocus={true}
          tabIndex={1}
          onDrop={handleDrop}
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
          tabIndex={-1}
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

function scrollToSelection(textArea: HTMLTextAreaElement, selectionStart: number, selectionEnd: number) {
  const fullText = textArea.value
  textArea.value = fullText.substring(0, selectionEnd)
  textArea.focus()
  textArea.scrollTop = textArea.scrollHeight
  textArea.value = fullText
  textArea.setSelectionRange(selectionStart, selectionEnd)
  textArea.focus()
}

interface NewMessageAlertProps {
  setInputValue: (newMessage: string) => void
  conversationId: string | undefined
}

const NewMessageAlert = ({ setInputValue, conversationId }: NewMessageAlertProps) => {
  const [newMessageAlert, setNewMessageAlert] = useState(false)
  const reopenWarning = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!conversationId) return

    const timer = setTimeout(
      () => {
        setNewMessageAlert(true)
      },
      15 * 60 * 1000,
    )
    return () => {
      clearTimeout(timer)
      if (reopenWarning.current) clearTimeout(reopenWarning.current)
    }
  }, [conversationId])

  const navigate = useNavigate()

  const startNew = () => {
    analytics.nySamtalePgaVarsel()
    setInputValue("")
    navigate("/", { state: { from: conversationId } })
  }

  const handleClose = () => {
    analytics.lukketNySamtaleVarsel()
    setNewMessageAlert(false)
    if (reopenWarning.current) clearTimeout(reopenWarning.current)
    reopenWarning.current = setTimeout(
      () => {
        setNewMessageAlert(true)
      },
      15 * 60 * 1000,
    )
  }

  return (
    newMessageAlert && (
      <Alert
        variant='info'
        size='small'
        closeButton={true}
        onClose={handleClose}
        className='fade-in mb-2'
      >
        <Heading
          size='xsmall'
          level='3'
          className='mb-2'
        >
          Psst!
        </Heading>
        <VStack gap='3'>
          Du har vært lenge i denne samtalen. Husk å starte en ny samtale når du får en ny henvendelse – da unngår du at
          Bob blander temaer.
          <Button
            variant='secondary-neutral'
            size='small'
            className='w-fit'
            onClick={startNew}
          >
            Start ny samtale
          </Button>
        </VStack>
      </Alert>
    )
  )
}
