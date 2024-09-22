import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateConversation } from "../../api/api"
import {
  Message,
  MessageRole,
  NewConversation,
  NewMessage,
} from "../../types/message"
import HistorySidebar from "../history/HistorySidebar"
import InputField from "../inputfield/InputField"
import Menu from "../menu/Menu"
import BobPlaceHolder from "./BobPlaceHolder"
import ChatDialog from "./ChatDialog"
import ContentWrapper from "./wrappers/ContentWrapper"
import DialogWrapper from "./wrappers/DialogWrapper"

function NewConversationContent() {
  const { createConversation } = useCreateConversation()
  const navigate = useNavigate()
  const [messagePlaceholders, setMessagePlaceholders] = useState<
    Partial<Message>[]
  >([])

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    setMessagePlaceholders([
      { content: message.content, messageRole: MessageRole.Human },
      { content: " ", messageRole: MessageRole.AI }, // TODO loading tekst/komponent.
    ])
    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`)
      })
      .catch((error) => {
        // blir på en måte det samme som `rollbackOnError`
        console.error(error)
        setMessagePlaceholders([])
      })
  }

  return (
    <ContentWrapper>
      <HistorySidebar />
      <DialogWrapper>
        <Menu />
        {messagePlaceholders.length === 0 && <BobPlaceHolder />}
        {messagePlaceholders.length !== 0 && (
          <ChatDialog
            messages={messagePlaceholders as Message[]}
            conversationId={"unknown"}
          />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default NewConversationContent
