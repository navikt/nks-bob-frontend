import { useParams } from "react-router-dom"
import { useMessagesEventSource, useSendMessage } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function ConversationContent() {
  const { conversationId } = useParams()
  const { messages, isLoading } = useMessagesEventSource(conversationId!)
  const { sendMessage } = useSendMessage(conversationId!)

  function handleUserMessage(message: NewMessage) {
    sendMessage(message, {
      optimisticData: [
        ...(messages ?? []),
        { content: message.content, messageRole: "human" },
        { content: "", messageRole: "ai" },
      ],
      rollbackOnError: true, // TODO default svar fra Bob hvis KBS ikke svarer.
    })
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
          />
        )}
      </div>
      <InputField onSend={handleUserMessage} disabled={isLoading} />
    </DialogWrapper>
  )
}

export default ConversationContent
