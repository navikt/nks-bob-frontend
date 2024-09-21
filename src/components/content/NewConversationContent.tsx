import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api"
import { Message, NewConversation, NewMessage } from "../../types/Message"
import HistoryContent from "../history/HistoryContent"
import InputField from "../inputfield/InputField"
import Menu from "../menu/Menu"
import BobPlaceHolder from "./BobPlaceHolder"
import ChatDialog from "./ChatDialog"
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
      { content: message.content, messageRole: "human" },
      { content: " ", messageRole: "ai" }, // TODO loading tekst/komponent.
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
    <div className="contentwrapper">
      <HistoryContent />
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
    </div>
  )
}

export default NewConversationContent
