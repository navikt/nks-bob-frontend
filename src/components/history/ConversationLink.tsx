import { BodyShort, Button } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { Conversation } from "../../types/Message.ts";

interface ConversationLinkProps {
  conversation: Conversation;
  loading: boolean;
}

function ConversationLink({ conversation, loading }: ConversationLinkProps) {
  return (
    <Button
      size="small"
      variant="tertiary-neutral"
      as={ReactRouter.Link}
      to={`/samtaler/${conversation.id}`}
      className="flex grow justify-start"
      loading={loading}
    >
      <BodyShort size="small">{conversation.title}</BodyShort>
    </Button>
  );
}

export default ConversationLink;
