import HistoryContent from "../history/HistoryContent.tsx";
import InputField from "../inputfield/InputField.tsx";
import Menu from "../menu/Menu.tsx";
import BobPlaceHolder from "./BobPlaceHolder.tsx";
import ChatDialog from "./ChatDialog.tsx";

import {
  useCreateConversation,
  useMessages,
  useSendMessage,
} from "../../api/api.ts";
import { NewConversation, NewMessage } from "../../types/Message.ts";

import { useNavigate } from "react-router-dom";
import ContentWrapper from "./wrappers/ContentWrapper.tsx";
import DialogWrapper from "./wrappers/DialogWrapper.tsx";

function Content({ conversationId }: { conversationId?: string }) {
  if (!conversationId) {
    return <NewConversationContent />;
  }

  return <ExistingConversationContent conversationId={conversationId} />;
}

function NewConversationContent() {
  const { createConversation } = useCreateConversation();
  const navigate = useNavigate();

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    };

    createConversation(newConversation).then((conversation: any) => {
      navigate(`/samtaler/${conversation.id}`);
    });
  }

  function handleNewChatClick() {}

  return (
    <ContentWrapper>
      <HistoryContent />
      <DialogWrapper>
        <Menu onNewChatClick={handleNewChatClick} />
        <BobPlaceHolder />
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  );
}

function ExistingConversationContent({
  conversationId,
}: {
  conversationId: string;
}) {
  const { messages, isLoading } = useMessages(conversationId);
  const { sendMessage } = useSendMessage(conversationId);

  function handleUserMessage(message: NewMessage) {
    sendMessage(message, {
      optimisticData: [
        ...(messages ?? []),
        { content: message.content, messageRole: "human" },
        { content: " ", messageRole: "ai" }, // TODO loading tekst/komponent.
      ],
      rollbackOnError: true, // TODO default svar fra Bob hvis KBS ikke svarer.
    });
  }

  function handleNewChatClick() {}

  return (
    <ContentWrapper>
      <HistoryContent />
      <DialogWrapper>
        <Menu onNewChatClick={handleNewChatClick} />
        {isLoading || !messages || messages.length < 0 ? (
          <BobPlaceHolder />
        ) : (
          <ChatDialog messages={messages} conversationId={conversationId} />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </ContentWrapper>
  );
}

export default Content;
