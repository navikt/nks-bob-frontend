import { BodyShort, Button } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { Conversation } from "../../types/Message.ts";

interface ConversationLinkProps {
  conversation: Conversation;
}

function ConversationLink({ conversation }: ConversationLinkProps) {
  return (
    <Button
      size="small"
      variant="tertiary-neutral"
      as={ReactRouter.Link}
      to={`/samtaler/${conversation.id}`}
      className="flex grow justify-start"
    >
      <BodyShort size="small">{conversation.title}</BodyShort>
    </Button>
  );
}

export default ConversationLink;
