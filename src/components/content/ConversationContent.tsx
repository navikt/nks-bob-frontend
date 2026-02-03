import { Link, useLocation, useNavigate, useParams } from "react-router"
import { useSendMessage } from "../../api/sse.ts"

import { ArrowDownIcon, NotePencilIcon } from "@navikt/aksel-icons"
import { Alert as AlertComponent, BodyShort, Button, Heading, HStack, Tooltip, VStack } from "@navikt/ds-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useHotkeys } from "react-hotkeys-hook"
import Markdown from "react-markdown"
import { isApiError, useAlerts, useMessages, useUserConfig } from "../../api/api.ts"
import embarressedBob from "../../assets/illustrations/EmbarrassedBob.svg"
import { NewMessage } from "../../types/Message.ts"
import { messageStore } from "../../types/messageStore.ts"
import { Alert } from "../../types/Notifications.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import AdminMenu from "./admin/menu/AdminMenu.tsx"
import { ShowAllSources } from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function ConversationContent() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false)

  const { conversationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const {
    messages: existingMessages,
    isLoading: isLoadingExistingMessages,
    isValidating,
  } = useMessages(conversationId!)
  const { sendMessage, isLoading } = useSendMessage(conversationId!)
  const { messages, setMessages } = messageStore()
  const { alerts } = useAlerts()
  const { userConfig } = useUserConfig()

  const inputContainerRef = useRef<HTMLDivElement | null>(null)
  const [inputHeight, setInputHeight] = useState(0)

  useEffect(() => {
    if (!isLoadingExistingMessages && !isLoading) {
      if (messages.length < existingMessages.length) {
        setMessages(existingMessages)
      }
    }
  }, [existingMessages, isLoadingExistingMessages, isLoading, setMessages])

  useEffect(() => {
    if (location.state?.initialMessage && !isValidating) {
      const initialMessage = location.state.initialMessage

      if (messages.length === 0) {
        sendMessage({ content: initialMessage })
        navigate(location.pathname, { replace: true, state: null })
      }
    }
  }, [location, messages, navigate, isValidating])

  function handleUserMessage(message: NewMessage) {
    sendMessage(message)
  }

  const { setFollowUp } = useInputFieldStore()

  const lastMessage = messages.at(-1)

  useEffect(() => {
    const followUp = lastMessage?.followUp ?? []
    setFollowUp(followUp)
  }, [lastMessage])

  useEffect(() => {
    const container = containerRef.current

    const handleScroll = () => {
      if (!container) return

      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      setShowScrollButton(!isAtBottom)
    }

    container?.addEventListener("scroll", handleScroll)
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [])

  useLayoutEffect(() => {
    const el = inputContainerRef.current
    if (!el) return

    const update = () => setInputHeight(el.clientHeight || 0)
    update()

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)
    window.addEventListener("resize", update)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  const buttonBaseOffset = 20
  const dynamicBottom = buttonBaseOffset + inputHeight

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

  useHotkeys("alt+ctrl+B", () => scrollToBottom(), {
    enableOnFormTags: true,
  })

  const isAdmin = userConfig?.userType === "admin"

  return (
    <div className='conversation-content'>
      <DialogWrapper>
        <Header conversation={conversationId} />
        <ErrorBanner alerts={alerts} />
        <div
          className='chatcontainer'
          ref={containerRef}
        >
          {!messages || messages.length < 0 ? (
            <WhitespacePlaceholder />
          ) : (
            <ChatContainer
              onSend={handleUserMessage}
              messages={messages}
              isLoading={isLoading}
            />
          )}
        </div>
        {showScrollButton && (
          <Tooltip content='Scroll til bunnen ( Alt+Ctrl+B )'>
            <Button
              data-color='neutral'
              icon={<ArrowDownIcon />}
              className='fixed left-1/2 -translate-x-1/2'
              style={{ bottom: dynamicBottom }}
              variant='primary'
              size='small'
              onClick={scrollToBottom}
              aria-label='Scroll til bunnen'
            />
          </Tooltip>
        )}
        <InputField
          onSend={handleUserMessage}
          disabled={isLoading}
          ref={inputContainerRef}
          allowPaste={isAdmin}
          minRows={1.3}
        />
      </DialogWrapper>
      <ShowAllSources />
      <AdminMenu />
    </div>
  )
}

const ErrorBanner = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length < 1) {
    return null
  }

  const { title, content, notificationType } = alerts.at(0)!
  const level = notificationType.toLowerCase() as "error" | "warning"

  return (
    <AlertComponent
      fullWidth
      size='small'
      variant={level}
      className='mb-4 w-full max-w-3xl'
    >
      <Heading
        spacing
        size='small'
        level='3'
      >
        {title}
      </Heading>
      <Markdown>{content}</Markdown>
    </AlertComponent>
  )
}

const ConversationNotFound = () => {
  const { conversationId } = useParams()
  return (
    <div className='conversation-content'>
      <div className='flex h-full w-full flex-col justify-between'>
        <Header conversation={conversationId} />
        <HStack
          gap='space-64'
          align='center'
          justify='center'
        >
          <img
            src={embarressedBob}
            alt='Embarresed Bob'
            width='200px'
          />
          <VStack
            className='max-w-[30%]'
            gap='space-16'
          >
            <Heading size='medium'>Samtalen ble ikke funnet</Heading>
            <BodyShort>Hvis samtalen er over 30 dager gammel så kan den ha blitt slettet.</BodyShort>
            <Link to='/'>
              <Button
                size='small'
                className='max-w-64'
                icon={<NotePencilIcon />}
                as='a'
              >
                Start en ny samtale
              </Button>
            </Link>
          </VStack>
        </HStack>
        <InputField
          onSend={() => {}}
          disabled={true}
        />
      </div>
    </div>
  )
}

export default () => {
  return (
    <ErrorBoundary
      FallbackComponent={ConversationNotFound}
      onError={(error: Error) => {
        if (isApiError(error) && error.status !== 404) {
          throw error
        }
      }}
    >
      <ConversationContent />
    </ErrorBoundary>
  )
}
