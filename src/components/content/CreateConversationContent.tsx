import { useNavigate } from "react-router"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"
import { useEffect } from "react"
import { useMessagesSubscription } from "../../api/ws.ts"

const CreateConversationContent = ( ) => {
  const navigate = useNavigate()

  const {createConversation, createdConversation} = useMessagesSubscription()

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    createConversation(newConversation)
  }

  useEffect(() => {
    if (createdConversation) {
        navigate(`/samtaler/${createdConversation.id}`, {})
    }
  }, [createdConversation])

  return (
    <CreateConversationWrapper>
      <Header conversation={undefined} />
      <BobPlaceholder />
      <InputField
        onSend={handleUserMessage}
        disabled={false}
        conversation={undefined}
      />
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
