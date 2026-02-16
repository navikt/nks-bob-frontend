import {
  Alert,
  BodyShort,
  Box,
  Button,
  Detail,
  Heading,
  HStack,
  Link,
  List,
  Textarea,
  Tooltip,
  VStack,
} from "@navikt/ds-react"

import { PaperplaneIcon } from "@navikt/aksel-icons"
import { forwardRef, useEffect, useRef, useState } from "react"

import * as React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate, useParams } from "react-router"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAlerts, useUserInfo } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import analytics from "../../utils/analytics.ts"
import {
  isError,
  isNotOk,
  isWarning,
  replaceValidationResult,
  validateAccountNumber,
  validateDateOfBirth,
  validateEmail,
  validateFirstName,
  validateFullName,
  validateGlobalPhoneNumber,
  validateNameAndDob,
  validateNorwegianMobileNumber,
  validatePersonnummer,
  ValidationError,
  ValidationResult,
  ValidationWarning,
  Validator,
} from "../../utils/inputValidation.ts"
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
  allowPaste?: boolean
  minRows?: number
}

const InputField = forwardRef<HTMLDivElement, InputFieldProps>(function InputField(
  { onSend, disabled, allowPaste = false, minRows = 5 },
  containerRef,
) {
  const { userInfo } = useUserInfo()
  const placeholderText = `Hei ${userInfo?.firstName}! Hva kan jeg hjelpe deg med?`
  const [isSensitiveInfoAlert, setIsSensitiveInfoAlert] = useState<boolean>(false)
  const [sendDisabled, setSendDisabled] = useState<boolean>(disabled)
  const [isFocused, setIsFocused] = useState(false)

  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [ignoredValidations, setIgnoredValidations] = useState<string[]>([])
  const allWarningValues = validationWarnings.flatMap(({ matches }) => matches.map(({ value }) => value))

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

    analytics.meldingSendt(trigger, message.content.length)
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

      if (!allowPaste) {
        e.preventDefault()
      }
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

  const validators: Validator[] = [
    validatePersonnummer,
    validateFullName,
    validateFirstName,
    validateEmail,
    validateAccountNumber,
    validateDateOfBirth,
    validateNorwegianMobileNumber,
    validateGlobalPhoneNumber,
    validateNameAndDob,
  ]

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

    const containsFnr = validationResults
      .filter(isError)
      .some((v) => v.validationType === "fnr" || v.validationType === "dnr" || v.validationType === "hnr")
    if (containsFnr) {
      analytics.tekstInneholderFnr()
    }

    warnings.forEach(({ validationType }) => analytics.valideringsfeil("warning", validationType))
    errors.forEach(({ validationType }) => analytics.valideringsfeil("error", validationType))

    const hasValidationError = errors.length > 0
    const hasValidationWarning = warnings.length > 0
    setSendDisabled(disabled || hasAlertErrors || hasValidationError || hasValidationWarning)
  }

  useEffect(() => {
    validateInput()
  }, [inputValue, disabled, hasAlertErrors, ignoredValidations])

  const prevSendDisabledRef = useRef<boolean>(true)
  useEffect(() => {
    if (prevSendDisabledRef.current && !sendDisabled) {
      if (inputValue.trim().length > 0) {
        textareaRef.current?.focus()
      }
    }
    prevSendDisabledRef.current = sendDisabled
  }, [sendDisabled, inputValue, textareaRef])

  function cleanInput(results: ValidationResult[]) {
    let newInputValue = inputValue
    results.filter(isNotOk).forEach(({ matches, validationType }) => {
      matches.forEach(({ value }) => {
        newInputValue = newInputValue.replaceAll(value, replaceValidationResult(validationType))
      })
    })

    setInputValue(newInputValue)
  }

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
  useHotkeys("Alt+Ctrl+F", () => sendMessage("hotkey", "Gjør om svaret til du-form", { clear: false, blur: false }), {
    enabled: !!conversationId,
    enableOnFormTags: true,
  })

  useHotkeys("Alt+Ctrl+F", () => sendMessage("hotkey", "Gjør om svaret til du-form", { clear: false, blur: false }), {
    enabled: !!conversationId,
    enableOnFormTags: true,
  })

  return (
    <div
      className='dialogcontent sticky bottom-0 h-auto flex-col self-center px-4'
      ref={containerRef}
      style={{ viewTransitionName: "input-field" }}
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
            className='mt-0.5 text-[16px]'
          >
            Vi har midlertidig slått av muligheten for å lime inn tekst
          </Heading>
          <BodyShort
            size='small'
            spacing
          >
            Årsaken er at det ved flere anledninger har blitt delt personopplysninger ved innliming.
          </BodyShort>
          <BodyShort
            size='small'
            spacing
          >
            Vi jobber aktivt med å finne en løsning.
          </BodyShort>
        </Alert>
      )}
      {validationWarnings.length > 0 && (
        <Alert
          variant='warning'
          size='small'
          className='fade-in mb-2'
        >
          <Heading
            size='xsmall'
            spacing
            className='mt-0.5 text-[16px]'
          >
            Spørsmålet ser ut til å inneholde personopplysninger
          </Heading>
          <BodyShort size='small'>
            Vurder om følgende er personopplysninger. Om det er tilfellet, må de fjernes før du sender inn spørsmålet.
          </BodyShort>
          <div className=''>
            <Box
              marginBlock='space-12'
              asChild
            >
              <List
                data-aksel-migrated-v8
                size='small'
              >
                {validationWarnings.flatMap(({ matches }, i) =>
                  matches.map(({ value, start, end }, j) => (
                    <List.Item
                      key={`warning-list-${i}-${j}`}
                      className='items-center'
                    >
                      <HStack
                        gap='space-2'
                        align='center'
                      >
                        <Tooltip content='Endre'>
                          <Link
                            onClick={() => {
                              if (textareaRef.current) {
                                scrollToSelection(textareaRef.current, start, end)
                              }
                            }}
                          >
                            <span className='font-ax-bold cursor-pointer'>{value}</span>
                          </Link>
                        </Tooltip>

                        <Button
                          data-color='neutral'
                          variant='tertiary'
                          size='xsmall'
                          onClick={() => {
                            validateInput([...ignoredValidations, value])
                          }}
                        >
                          Ignorer
                        </Button>
                      </HStack>
                    </List.Item>
                  )),
                )}
              </List>
            </Box>
          </div>
          <HStack
            gap='space-4'
            className='mt-4'
          >
            <Button
              data-color='neutral'
              size='small'
              variant='primary'
              onClick={() => {
                cleanInput(validationWarnings)
              }}
            >
              Fjern alle
            </Button>
            <Button
              data-color='neutral'
              size='small'
              variant='tertiary'
              onClick={() => {
                validateInput([...ignoredValidations, ...allWarningValues])
              }}
            >
              Ignorer alle
            </Button>
          </HStack>
        </Alert>
      )}
      {validationErrors.length > 0 && (
        <Alert
          variant='error'
          size='small'
          className='fade-in mb-2'
        >
          <Heading
            size='xsmall'
            spacing
            className='mt-0.5 text-[16px]'
          >
            Spørsmålet inneholder fødselsnummer/d-nummer/hnr
          </Heading>

          <BodyShort size='small'>Fjern følgende før du sender inn spørsmålet.</BodyShort>
          <div>
            <Box
              marginBlock='space-12'
              asChild
            >
              <List
                data-aksel-migrated-v8
                size='small'
              >
                {validationErrors.flatMap(({ matches }, i) =>
                  matches.map(({ value, start, end }, j) => (
                    <List.Item
                      key={`error-list-${i}-${j}`}
                      className='items-center'
                    >
                      <HStack
                        gap='space-2'
                        align='center'
                      >
                        <Link
                          onClick={() => {
                            if (textareaRef.current) {
                              scrollToSelection(textareaRef.current, start, end)
                            }
                          }}
                        >
                          <span className='font-ax-bold cursor-pointer'>{value}</span>
                        </Link>
                      </HStack>
                    </List.Item>
                  )),
                )}
              </List>
            </Box>
          </div>

          <Button
            size='small'
            data-color='neutral'
            variant='primary'
            className='mt-2'
            onClick={() => {
              cleanInput(validationErrors)
            }}
          >
            Fjern alle
          </Button>
        </Alert>
      )}
      <NewMessageAlert
        setInputValue={setInputValue}
        conversationId={conversationId}
      />
      <div className='inputfield relative flex max-w-3xl flex-col items-center justify-end'>
        <Textarea
          resize={isFocused ? "vertical" : false}
          ref={textareaRef}
          size='medium'
          label=''
          hideLabel
          className='dialogcontent mb-3 min-h-10.75 truncate [&_textarea]:max-h-112.5 [&_textarea]:min-h-10.75 [&_textarea]:focus:min-h-12.5'
          minRows={minRows}
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
          }}
        />
        <Button
          icon={<PaperplaneIcon title='Send melding' />}
          variant='tertiary-neutral'
          size='medium'
          className='absolute top-[2%] right-[0.2%] h-full max-h-[2.5rem] w-full max-w-[2.3rem]'
          onClick={handleButtonClick}
          disabled={sendDisabled}
          tabIndex={-1}
        />
      </div>
      <Detail
        align='center'
        className='text-ax-text-neutral-subtle mx-2 pb-2'
      >
        Ikke del personopplysninger og sjekk kilder om du er usikker - Bob er en kunstig intelligens og kan ta feil.
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

  const WARNING_TIMER = 30 * 60 * 1000

  useEffect(() => {
    if (!conversationId) return

    const timer = setTimeout(() => {
      setNewMessageAlert(true)
    }, WARNING_TIMER)
    return () => {
      clearTimeout(timer)
      if (reopenWarning.current) clearTimeout(reopenWarning.current)
    }
  }, [conversationId])

  const navigate = useNavigate()

  const startNew = () => {
    analytics.nySamtalePgaVarsel()
    setInputValue("")
    navigate("/", { state: { from: conversationId }, viewTransition: true })
  }

  const handleClose = () => {
    analytics.lukketNySamtaleVarsel()
    setNewMessageAlert(false)
    if (reopenWarning.current) clearTimeout(reopenWarning.current)
    reopenWarning.current = setTimeout(() => {
      setNewMessageAlert(true)
    }, WARNING_TIMER)
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
        <VStack gap='space-12'>
          Du har vært lenge i denne samtalen. Husk å starte en ny samtale når du får en ny henvendelse – da unngår du at
          Bob blander temaer.
          <Button
            data-color='neutral'
            variant='secondary'
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
