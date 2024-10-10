import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
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
        <div className='flex flex-grow'>
          <iframe
            id='iFrameExample'
            title='iFrame Example'
            src='https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Arbeidsavklaringspenger/kA02o000000M9BVCA0.html'
          ></iframe>
        </div>
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </div>
  )
}

export default CreateConversationContent
