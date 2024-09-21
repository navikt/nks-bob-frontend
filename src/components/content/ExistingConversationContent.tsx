import { useMessages, useSendMessage } from "../../api/api"
import { NewMessage } from "../../types/Message"
import HistoryContent from "../history/HistoryContent"
import InputField from "../inputfield/InputField"
import Menu from "../menu/Menu"
import BobPlaceHolder from "./BobPlaceHolder"
import ChatDialog from "./ChatDialog"
import ContentWrapper from "./wrappers/ContentWrapper"
import DialogWrapper from "./wrappers/DialogWrapper"

function ExistingConversationContent({
  conversationId,
}: {
  conversationId: string
}) {
  const { messages, isLoading } = useMessages(conversationId)
  const { sendMessage } = useSendMessage(conversationId)

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
      <HistoryContent />
      <DialogWrapper>
        <Menu />
        {isLoading || !messages || messages.length < 0 ? (
          <BobPlaceHolder />
        ) : (
          <ChatDialog messages={messages} conversationId={conversationId} />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default ExistingConversationContent
