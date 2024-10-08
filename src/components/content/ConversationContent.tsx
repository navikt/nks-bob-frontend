import { useParams } from "react-router-dom"
import { useMessages, useSendMessage } from "../../api/api.ts"
import { NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
import Menu from "../menu/Menu.tsx"
import ChatDialog from "./chat/ChatDialog.tsx"
import BobPlaceHolder from "./placeholders/BobPlaceHolder.tsx"
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
        { id: "temp-human", content: message.content, messageRole: "human" },
        { id: "temp-ai", content: "Bob tenker...", messageRole: "ai" },
      ],
      rollbackOnError: true, // TODO default svar fra Bob hvis KBS ikke svarer.
    })
  }

  return (
    <ContentWrapper>
      <HistoryContent />
      <DialogWrapper>
        <Menu />
        {isLoading || !messages || messages.length < 0 ? (
          <BobPlaceHolder />
        ) : (
          <ChatDialog messages={messages} conversationId={conversationId!} />
        )}
        <div className='dialogcontent'>
          <InputField onSend={handleUserMessage} />
        </div>
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default ConversationContent
