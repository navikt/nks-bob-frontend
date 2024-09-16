import BobPlaceHolder from "./BobPlaceHolder.tsx";
import InputField from "../inputfield/InputField.tsx";
import ChatDialog from "./ChatDialog.tsx";
import { NewMessage } from "../../types/Message.ts";
import Menu from "../menu/Menu.tsx";
import { useMessages, useSendMessage, } from "../../api/api.ts";
import {useState} from "react";

// TODO opprett conversation
const CONVERSATION_ID = "6cf0b651-e5f1-4148-a2e1-9634e6cfa29e"

function Content() {
  const { messages, isLoading } = useMessages(CONVERSATION_ID)
  const { sendMessage } = useSendMessage(CONVERSATION_ID)
  const [isNewChat, setIsNewChat] = useState(false)

  function handleUserMessage(message: NewMessage) {
    sendMessage(message, {
      optimisticData: [
        ...messages ?? [],
        { content: message.content, messageRole: "human" },
        { content: " ", messageRole: "ai" } // TODO loading tekst/komponent.
      ],
      rollbackOnError: true, // TODO default svar fra Bob hvis KBS ikke svarer.
    })
  }

  function handleNewChatClick() {
    setIsNewChat(true)
  }

  return (
    <div className="flex flex-col justify-center h-full w-full">
      <Menu onNewChatClick={handleNewChatClick} />
      {isNewChat || isLoading || !messages || messages.length < 0 ? (
        <BobPlaceHolder />
      ) : (
        <ChatDialog messages={messages} conversationId={CONVERSATION_ID} />
      )}
      <InputField onSend={handleUserMessage} />
    </div>
  );
}

export default Content;
