import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
import BobPlaceHolder from "./placeholders/BobPlaceHolder.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

const CreateConversationContent = () => {
  const { createConversation } = useCreateConversation()
  const navigate = useNavigate()

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`, {})
      })

      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div className='contentwrapper'>
      <HistoryContent />
      <DialogWrapper>
        <BobPlaceHolder />
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </div>
  )
}

export default CreateConversationContent
