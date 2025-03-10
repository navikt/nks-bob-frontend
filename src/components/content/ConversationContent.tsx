import { useParams, useSearchParams } from "react-router"
import { useMessagesSubscription } from "../../api/ws.ts"

import { useEffect } from "react"
import { NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import {
  ShowAllSources,
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
    </div>
  )
}

export default ConversationContent
