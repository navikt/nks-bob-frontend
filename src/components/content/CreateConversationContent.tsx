import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import { messageStore } from "../../types/messageStore.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"

const CreateConversationContent = () => {
  const navigate = useNavigate()
  const { createConversation } = useCreateConversation()
  const { setInputValue, setFollowUp } = useInputFieldStore()
  const { resetMessages } = messageStore()

  useEffect(() => {
    // reset input state on first render.
    setInputValue("")
    setFollowUp([])
    resetMessages()
  }, [])

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
      <InputField onSend={handleUserMessage} disabled={false} />
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
