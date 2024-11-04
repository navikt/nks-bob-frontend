import { useNavigate } from "react-router-dom"
import { useCreateConversation, useUserConfig } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import FirstTimeLoginInfo from "./information/FirstTimeLoginInfo.tsx"
import { BobPlaceholder } from "./placeholders/Placeholders.tsx"
import CreateConversationWrapper from "./wrappers/CreateConversationWrapper.tsx"

const CreateConversationContent = () => {
  const navigate = useNavigate()
  const { createConversation } = useCreateConversation()
  const { userConfig } = useUserConfig()

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
    <CreateConversationWrapper>
      <Header conversation={undefined} />
      {userConfig?.showStartInfo && <FirstTimeLoginInfo />}
      <BobPlaceholder />
      <InputField onSend={handleUserMessage} disabled={false} />
    </CreateConversationWrapper>
  )
}

export default CreateConversationContent
