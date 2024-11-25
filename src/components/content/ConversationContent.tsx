import { useParams } from "react-router"
import { useMessagesSubscription } from "../../api/ws.ts"

import { NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function ConversationContent() {
  const { conversationId } = useParams()
  const { messages, sendMessage, isLoading } = useMessagesSubscription(
    conversationId!,
  )

  function handleUserMessage(message: NewMessage) {
    sendMessage(message)
  }

  return (
    <DialogWrapper>
      <Header conversation={conversationId} />
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
      <InputField onSend={handleUserMessage} disabled={isLoading} />
    </DialogWrapper>
  )
}

export default ConversationContent
