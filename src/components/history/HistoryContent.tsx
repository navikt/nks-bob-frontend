import { Heading, Link } from "@navikt/ds-react";
import * as ReactRouter from "react-router-dom";
import { useConversations } from "../../api/api";
import { Conversation } from "../../types/Message";

function HistoryContent() {
  const { conversations, isLoading } = useConversations();

  return (
    <div className="h-full w-full max-w-60 overflow-scroll bg-bg-subtle p-4 max-md:hidden">
      <Heading size="small" className="mb-6 pt-2">
        Dine samtaler
      </Heading>
      {conversations && conversations.length > 0 && !isLoading && (
        <ul className="w-full list-none">
          {conversations.map((conversation) => (
            <li>
              <ConversationLink
                key={conversation.id}
                conversation={conversation}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConversationLink({ conversation }: { conversation: Conversation }) {
  return (
    <Link as={ReactRouter.Link} to={`/samtaler/${conversation.id}`}>
      {conversation.title}
    </Link>
  );
}

export default HistoryContent;
