import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useCreateConversation, useUserConfig } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import { messageStore } from "../../types/messageStore.ts"
import Header from "../header/Header.tsx"
import InputField, { useInputFieldStore } from "../inputfield/InputField.tsx"
import { useSourcesStore } from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"
import analytics from "../../utils/analytics.ts"

const CreateConversationContent = () => {
  const navigate = useNavigate()
  const { createConversation } = useCreateConversation()
  const { setFollowUp } = useInputFieldStore()
  const { setActiveMessage } = useSourcesStore()
  const { resetMessages } = messageStore()
  const { userConfig } = useUserConfig()

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

    createConversation(newConversation)
      .then((conversation) => {
        analytics.nySamtaleOpprettet(conversation.id)
        navigate(`/samtaler/${conversation.id}`, { state: { initialMessage: message.content } })
      })

      .catch((error) => {
        console.log(error)
      })
  }

  const isAdmin = userConfig?.userType === "admin"

  return (
    <CreateConversationWrapper>
      <Header conversation={undefined} />
      <BobPlaceholder />

      <InputField
        onSend={handleUserMessage}
        disabled={false}
        allowPaste={isAdmin}
      />
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
