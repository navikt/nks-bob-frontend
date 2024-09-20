import { BodyShort, Button } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Conversation } from "../../types/Message.ts";
import DeleteConversation from "./DeleteConversation.tsx";

interface ConversationLinkProps {
  conversation: Conversation;
  loading: boolean;
}

function ConversationLink({ conversation, loading }: ConversationLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === `/samtaler/${conversation.id}`;

  return (
    <div className="flex justify-start">
      <Button
        size="small"
        variant="tertiary-neutral"
        as={ReactRouter.Link}
        to={`/samtaler/${conversation.id}`}
        className={`flex grow justify-start ${
          isActive ? "bg-surface-neutral-subtle" : ""
        }`}
        loading={loading}
      >
        <BodyShort size="small" weight={isActive ? "semibold" : "regular"}>
          {conversation.title}
        </BodyShort>
      </Button>
      <DeleteConversation conversationId={conversation.id} />
    </div>
  );
}

export default ConversationLink;
