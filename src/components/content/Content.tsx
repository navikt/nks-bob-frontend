import HistoryContent from "../history/HistoryContent.tsx";
import Menu from "../menu/Menu.tsx";
import BobPlaceHolder from "./BobPlaceHolder.tsx";
import ChatDialog from "./ChatDialog.tsx";
import InputField from "../inputfield/InputField.tsx";

import { NewMessage } from "../../types/Message.ts";
import { useMessages, useSendMessage, } from "../../api/api.ts";

import DialogWrapper from "./wrappers/DialogWrapper.tsx";
import ContentWrapper from "./wrappers/ContentWrapper.tsx";

// TODO opprett conversation
const CONVERSATION_ID = "6cf0b651-e5f1-4148-a2e1-9634e6cfa29e"

function Content() {
  const { messages, isLoading } = useMessages(CONVERSATION_ID)
  const { sendMessage } = useSendMessage(CONVERSATION_ID)

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
  }

  return (
      <ContentWrapper>
        <HistoryContent />
      <DialogWrapper>
      <Menu onNewChatClick={handleNewChatClick} />
      {isLoading || !messages || messages.length < 0 ? (
        <BobPlaceHolder />
      ) : (
        <ChatDialog messages={messages} conversationId={CONVERSATION_ID} />
      )}
      <InputField onSend={handleUserMessage} />
      </DialogWrapper>
      </ContentWrapper>
  );
}

export default Content;
