import { useNavigate, useParams } from "react-router-dom"

import { useEffect } from "react"
import { useMessages, useSendMessage } from "../../api/api"
import { MessageRole, NewMessage } from "../../types/message"
import HistorySidebar from "../history/HistorySidebar"
import InputField from "../inputfield/InputField"
import Menu from "../menu/Menu"
import BobPlaceHolder from "./BobPlaceHolder"
import ChatDialog from "./ChatDialog"
import ContentWrapper from "./wrappers/ContentWrapper"
import DialogWrapper from "./wrappers/DialogWrapper"

function ExistingConversationContent() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()

  const { messages, isLoading, error } = useMessages(conversationId!)
  const { sendMessage } = useSendMessage(conversationId!)

  // TODO: Håndtere når param :conversationId ikke er en gyldig id.
  useEffect(() => {
    if (error) {
      // TODO: Vise en midlertidig feilmelding?
      console.log(
        `En feil skjedde ved innhenting av Messages. Error: ${error.message}`,
      )
      navigate("/")
    }
  }, [error, navigate])

  function handleUserMessage(message: NewMessage) {
    sendMessage(message, {
      optimisticData: [
        ...(messages ?? []),
        { content: message.content, messageRole: MessageRole.Human },
        { content: " ", messageRole: MessageRole.AI }, // TODO loading tekst/komponent.
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
