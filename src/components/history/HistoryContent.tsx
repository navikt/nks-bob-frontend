import { Heading, Link } from "@navikt/ds-react";
import { useConversations } from "../../api/api";
import { Conversation } from "../../types/Message";

function HistoryContent() {
  const { conversations, isLoading } = useConversations();

  return (
    <div className="sticky left-0 top-16 min-w-60 bg-bg-subtle p-4 max-md:hidden">
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
  return <Link>{conversation.title}</Link>;
}

export default HistoryContent;
