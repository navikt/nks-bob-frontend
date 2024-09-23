import HistoryContent from "../history/HistorySidebar.tsx";
import InputField from "../inputfield/InputField.tsx";
import Menu from "../menu/Menu.tsx";
import BobPlaceHolder from "./BobPlaceHolder.tsx";
import ChatDialog from "./ChatDialog.tsx";

import {
  useCreateConversation,
  useMessages,
  useSendMessage,
} from "../../api/api.ts";
import { Message, NewConversation, NewMessage } from "../../types/Message.ts";

import { useState } from "react";
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
  const [messagePlaceholders, setMessagePlaceholders] = useState<
    Partial<Message>[]
  >([]);

  function handleUserMessage(message: NewMessage) {
    const newConversation: NewConversation = {
      title: message.content,
      initialMessage: { content: message.content },
    };

    setMessagePlaceholders([
      { content: message.content, messageRole: "human" },
      { content: " ", messageRole: "ai" }, // TODO loading tekst/komponent.
    ]);
    createConversation(newConversation)
      .then((conversation) => {
        navigate(`/samtaler/${conversation.id}`);
      })
      .catch((error) => {
        // blir på en måte det samme som `rollbackOnError`
        console.error(error);
        setMessagePlaceholders([]);
      });
  }

  return (
    <div className="contentwrapper">
      <HistoryContent />
      <DialogWrapper>
        <Menu />
        {messagePlaceholders.length === 0 && <BobPlaceHolder />}
        {messagePlaceholders.length !== 0 && (
          <ChatDialog
            messages={messagePlaceholders as Message[]}
            conversationId={"unknown"}
          />
        )}
        <InputField onSend={handleUserMessage} />
      </DialogWrapper>
    </div>
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

  return (
    <ContentWrapper>
      <HistoryContent />
      <DialogWrapper>
        <Menu />
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
