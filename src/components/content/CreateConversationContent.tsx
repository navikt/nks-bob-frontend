import { useState } from "react"
import { useNavigate } from "react-router"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"

const CreateConversationContent = () => {
  const navigate = useNavigate()
  const { createConversation } = useCreateConversation()
  const inputState = useState<string>("")

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: null,
    }

    const initialMessage = encodeURIComponent(message.content)

    createConversation(newConversation)
      .then((conversation) => {
        navigate(
          `/samtaler/${conversation.id}?initialMessage=${initialMessage}`,
          {},
        )
      })

      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <CreateConversationWrapper>
      <Header conversation={undefined} />
      <BobPlaceholder />
      <InputField
        inputState={inputState}
        onSend={handleUserMessage}
        disabled={false}
        followUp={[]}
      />
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
