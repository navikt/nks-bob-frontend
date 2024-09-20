import { Heading } from "@navikt/ds-react";
import { useConversations } from "../../api/api";
import ConversationLink from "./ConversationLink.tsx";

function HistoryContent() {
  const { conversations, isLoading } = useConversations();

  return (
    <div className="h-full w-full max-w-60 overflow-scroll bg-bg-subtle p-3 max-md:hidden">
      <Heading size="small" className="mb-6 pt-2">
        Dine samtaler
      </Heading>
      {conversations && conversations.length > 0 && !isLoading && (
        <ol className="flex w-full list-none flex-col gap-0.5">
          {conversations
            .slice()
            .reverse()
            .map((conversation) => (
              <li key={conversation.id}>
                <ConversationLink
                  conversation={conversation}
                  loading={isLoading}
                />
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}

export default HistoryContent;
