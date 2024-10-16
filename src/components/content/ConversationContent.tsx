import { useParams } from "react-router-dom"
import { useMessages, useSendMessage } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import InputField from "../inputfield/InputField.tsx"
import Menu from "../menu/Menu.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import ContentWrapper from "./wrappers/ContentWrapper.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function ConversationContent() {
  const { conversationId } = useParams()
  const { messages, isLoading } = useMessages(conversationId!)
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
    <ContentWrapper>
      <DialogWrapper>
        <Menu />
        {isLoading || !messages || messages.length < 0 ? (
          <WhitespacePlaceholder />
        ) : (
          <ChatContainer messages={messages} conversationId={conversationId!} />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default ConversationContent
