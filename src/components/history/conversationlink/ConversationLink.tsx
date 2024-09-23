import { BodyShort, Button } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Conversation } from "../../../types/Message.ts";
import "./ConversationLink.css";

interface ConversationLinkProps {
  conversation: Conversation;
}

function ConversationLink({ conversation }: ConversationLinkProps) {
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
      >
        <BodyShort
          size="small"
          weight={isActive ? "semibold" : "regular"}
          className="text-overflow"
        >
          {conversation.title}
        </BodyShort>
      </Button>
    </div>
  );
}

export default ConversationLink;
