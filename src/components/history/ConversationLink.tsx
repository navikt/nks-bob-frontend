import { BodyShort, Button } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Conversation } from "../../types/Message.ts";

interface ConversationLinkProps {
  conversation: Conversation;
  loading: boolean;
}

function ConversationLink({ conversation, loading }: ConversationLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === `/samtaler/${conversation.id}`;

  return (
    <Button
      size="small"
      variant="tertiary-neutral"
      as={ReactRouter.Link}
      to={`/samtaler/${conversation.id}`}
      className={`flex grow justify-start ${
        isActive ? "bg-surface-neutral-subtle" : ""
      }`}
      loading={loading}
      weight="regular"
    >
      <BodyShort size="small" weight={isActive ? "semibold" : "regular"}>
        {conversation.title}
      </BodyShort>
    </Button>
  );
}

export default ConversationLink;
