import { useNavigate } from "react-router-dom"
import { useCreateConversation, useMessages } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import BobPlaceHolder from "./placeholders/BobPlaceHolder.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

const CreateConversationContent = () => {
  const { createConversation } = useCreateConversation()
  const navigate = useNavigate()
  const { messages, addOptimisticMessage } = useMessages("new")

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    addOptimisticMessage({ content: message.content, messageRole: "human" })
    addOptimisticMessage({ content: "", messageRole: "ai" })

    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`, {
          state: { messages: messages },
        })
      })

      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div className='contentwrapper'>
      <HistoryContent />
      <DialogWrapper>
        {messages && messages.length > 0 ? (
          <ChatContainer messages={messages} conversationId='new message' />
        ) : (
          <BobPlaceHolder />
        )}
        <BobPlaceHolder />
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </div>
  )
}

export default CreateConversationContent
