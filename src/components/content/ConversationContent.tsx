import { useParams, useSearchParams } from "react-router"
import { useSendMessage } from "../../api/sse.ts"

import { Alert as AlertComponent, Heading } from "@navikt/ds-react"
import { useEffect } from "react"
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
  const { conversationId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const { messages: existingMessages, isLoading: isLoadingExistingMessages } =
    useMessages(conversationId!)
  const { sendMessage, isLoading } = useSendMessage(conversationId!)
  const { messages, setMessages } = messageStore()
  const { alerts } = useAlerts()

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

  return (
    <div className='conversation-content'>
      <DialogWrapper>
        <Header conversation={conversationId} />
        <ErrorBanner alerts={alerts} />
        <div className='chatcontainer'>
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
        <InputField onSend={handleUserMessage} disabled={isLoading} />
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
      <Heading spacing size='small' level='3'>
        {title}
      </Heading>
      <Markdown>{content}</Markdown>
    </AlertComponent>
  )
}

export default ConversationContent
