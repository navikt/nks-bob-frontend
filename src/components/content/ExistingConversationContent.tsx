import { useParams } from "react-router-dom"
import { useMessages, useSendMessage } from "../../api/api"
import { NewMessage } from "../../types/Message"
import HistorySidebar from "../history/HistorySidebar"
import InputField from "../inputfield/InputField"
import Menu from "../menu/Menu"
import BobPlaceHolder from "./BobPlaceHolder"
import ChatDialog from "./ChatDialog"
import ContentWrapper from "./wrappers/ContentWrapper"
import DialogWrapper from "./wrappers/DialogWrapper"

function ExistingConversationContent() {
  const { conversationId } = useParams()

  const { messages, isLoading } = useMessages(conversationId!)
  const { sendMessage } = useSendMessage(conversationId!)

  function handleUserMessage(message: NewMessage) {
    sendMessage(message, {
      optimisticData: [
        ...(messages ?? []),
        { content: message.content, messageRole: "human" },
        { content: " ", messageRole: "ai" }, // TODO loading tekst/komponent.
      ],
      rollbackOnError: true, // TODO default svar fra Bob hvis KBS ikke svarer.
    })
  }

  return (
    <ContentWrapper>
      <HistorySidebar />
      <DialogWrapper>
        <Menu />
        {isLoading || !messages || messages.length < 0 ? (
          <BobPlaceHolder />
        ) : (
          <ChatDialog messages={messages} conversationId={conversationId!} />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default ExistingConversationContent
