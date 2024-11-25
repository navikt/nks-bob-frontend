import { useNavigate } from "react-router"
import { useCreateConversation } from "../../api/api.ts"
import { Conversation, NewConversation, NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"
import { useEffect } from "react"
import { useMessagesSubscription } from "../../api/ws.ts"

const CreateConversationContent = (
  // {createConversation, createdConversation }: {
// createConversation: (conversation: NewConversation) => void
// , createdConversation: Conversation | null}
) => {
  const navigate = useNavigate()

  const {createConversation, createdConversation } = useMessagesSubscription()

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    createConversation(newConversation)
      // .then((conversation) => {
      //   navigate(`/samtaler/${conversation.id}`, {})
      // })

      // .catch((error) => {
      //   console.log(error)
      // })
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
