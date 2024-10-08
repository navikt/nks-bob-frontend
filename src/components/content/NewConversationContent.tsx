import { useNavigate } from "react-router-dom"
import { useCreateConversation } from "../../api/api.ts"
import { NewConversation, NewMessage } from "../../types/Message.ts"
import HistoryContent from "../history/HistorySidebar.tsx"
import InputField from "../inputfield/InputField.tsx"
import BobPlaceHolder from "./BobPlaceHolder.tsx"
import DialogWrapper from "./wrappers/DialogWrapper.tsx"

function NewConversationContent() {
  const { createConversation } = useCreateConversation()
  const navigate = useNavigate()
  // const [messagePlaceholders, setMessagePlaceholders] = useState<
  //   Partial<Message>[]
  // >([])

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    }

    // setMessagePlaceholders([
    //   { content: message.content, messageRole: "human" },
    //   { content: " ", messageRole: "ai" }, // TODO loading tekst/komponent.
    // ])
    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`)
      })
      .catch((error) => {
        // blir på en måte det samme som `rollbackOnError`
        console.error(error)
        // setMessagePlaceholders([])
      })
  }

  return (
    <div className='contentwrapper'>
      <HistoryContent />
      <DialogWrapper>
        <BobPlaceHolder />
        {/*{messagePlaceholders.length !== 0 && (*/}
        {/*  <ChatDialog*/}
        {/*    messages={messagePlaceholders as Message[]}*/}
        {/*    conversationId={"unknown"}*/}
        {/*  />*/}
        {/*)}*/}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </div>
  )
}

export default NewConversationContent
