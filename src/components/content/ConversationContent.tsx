import { useParams, useSearchParams } from "react-router"
import { useSendMessage } from "../../api/sse.ts"

import { ArrowDownIcon } from "@navikt/aksel-icons"
import { Alert as AlertComponent, Button, Heading, Tooltip } from "@navikt/ds-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import Markdown from "react-markdown"
import { useAlerts, useMessages } from "../../api/api.ts"
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
  const [searchParams, setSearchParams] = useSearchParams()

  const { messages: existingMessages, isLoading: isLoadingExistingMessages } = useMessages(conversationId!)
  const { sendMessage, isLoading } = useSendMessage(conversationId!)
  const { messages, setMessages } = messageStore()
  const { alerts } = useAlerts()

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
    if (searchParams.has("initialMessage")) {
      const initialMessage = searchParams.get("initialMessage")!

      if (messages.length === 0) {
        sendMessage({ content: initialMessage })
      }

      searchParams.delete("initialMessage")
      setSearchParams({ ...searchParams })
    }
  }, [searchParams, messages])

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

  useHotkeys("alt+ctrl+B", () => scrollToBottom())

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
              icon={<ArrowDownIcon />}
              className='fixed left-1/2 -translate-x-1/2'
              style={{ bottom: dynamicBottom }}
              variant='primary-neutral'
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
      className='mb-4 w-full max-w-[48rem]'
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

export default ConversationContent
