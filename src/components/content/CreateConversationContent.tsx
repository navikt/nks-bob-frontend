import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import InputField from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import ContentWrapper from "./wrappers/ContentWrapper.tsx"
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
    <ContentWrapper>
      <DialogWrapper>
        <div className='mt-20 flex w-full max-w-2xl flex-col justify-center gap-20'>
          <BobPlaceholder />
          <InputField onSend={handleUserMessage} />
        </div>
      </DialogWrapper>
    </ContentWrapper>
  )
}

export default CreateConversationContent
