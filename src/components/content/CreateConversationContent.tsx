import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import { messageStore } from "../../types/messageStore.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"
import { useSourcesStore } from "./chat/chatbubbles/sources/ShowAllSources.tsx"

const CreateConversationContent = () => {
  const navigate = useNavigate()
  const { createConversation } = useCreateConversation()
  const { setFollowUp } = useInputFieldStore()
  const { setActiveMessage } = useSourcesStore()
  const { resetMessages } = messageStore()

  useEffect(() => {
    // reset message state on first render.
    setFollowUp([])
    resetMessages()
    // reset sources sidebar
    setActiveMessage(null)
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
