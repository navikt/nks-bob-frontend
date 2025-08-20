import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useAdminMessages } from "../../api/admin.ts"
import Header from "../header/Header.tsx"
import InputField from "../inputfield/InputField.tsx"
import { ShowAllSources } from "./chat/chatbubbles/sources/ShowAllSources.tsx"
import ChatContainer from "./chat/ChatContainer.tsx"
import { WhitespacePlaceholder } from "./placeholders/Placeholders.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

export default function ConversationAdminContent() {
  const { conversationId } = useParams()
  const { messages, isLoading, error } = useAdminMessages(conversationId!)
  const navigate = useNavigate()

  const handleUserMessage = () => {}

  useEffect(() => {
    console.error(error)
    if (error?.status === 401) {
      console.warn("This user does not have access to the admin endpoint.")
      navigate("/")
    }
  }, [error])

  return (
    <div className='conversation-content'>
      <DialogWrapper>
        <Header conversation={conversationId} />
        <div className='chatcontainer'>
          {!messages || messages.length < 0 ? (
            <WhitespacePlaceholder />
          ) : (
            <ChatContainer
              onSend={handleUserMessage}
              messages={messages}
              isLoading={isLoading}
            />
          )}
        </div>
        <InputField
          onSend={handleUserMessage}
          disabled={true}
        />
      </DialogWrapper>
      <ShowAllSources />
    </div>
  )
}
