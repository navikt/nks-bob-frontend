import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
import BobPlaceHolder from "./BobPlaceHolder.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function NewConversationContent() {
  const { createConversation } = useCreateConversation()
  const navigate = useNavigate()

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`)
      })
      .catch((error) => {
        // blir på en måte det samme som `rollbackOnError`
        console.error(error)
      })
  }

  return (
    <div className='contentwrapper'>
      <HistoryContent />
      <DialogWrapper>
        <BobPlaceHolder />
        <div className='dialogcontent pb-14'>
          <InputField onSend={handleUserMessage} />
        </div>
      </DialogWrapper>
    </div>
  )
}

export default NewConversationContent
