import { useParams, useSearchParams } from "react-router"
import { useMessagesSubscription } from "../../api/ws.ts"

import { useEffect } from "react"
import { NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldContext } from "../inputfield/InputField.tsx"
import {
  ShowAllSources,
  SourcesContextProvider,
} from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function ConversationContent() {
  const { conversationId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const { messages, sendMessage, isLoading } = useMessagesSubscription(
    conversationId!,
  )

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

  const { setFollowUp } = useInputFieldContext()

  const lastMessage = messages.at(-1)

  useEffect(() => {
    const followUp = lastMessage?.followUp ?? []
    setFollowUp(followUp)
  }, [lastMessage])

  return (
    <div className='conversation-content'>
      <SourcesContextProvider>
        <DialogWrapper>
          <Header />
          <div className='chatcontainer'>
            {!messages || messages.length < 0 ? (
              <WhitespacePlaceholder />
            ) : (
              <ChatContainer
                onSend={handleUserMessage}
                messages={messages}
                conversationId={conversationId!}
                isLoading={isLoading}
              />
            )}
          </div>
          <InputField
            onSend={handleUserMessage}
            disabled={isLoading}
            newConversation={conversationId}
          />
        </DialogWrapper>
        <ShowAllSources />
      </SourcesContextProvider>
    </div>
  )
}

export default ConversationContent
