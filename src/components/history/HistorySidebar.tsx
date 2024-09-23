import { Heading } from "@navikt/ds-react"

import { useConversations } from "../../api/api"

import "./HistorySidebar.css"
import ConversationLink from "./conversationlink/ConversationLink"

function HistorySidebar() {
  const { conversations, isLoading } = useConversations()

  return (
    <div className="HistorySidebar h-full w-full max-w-60 overflow-scroll bg-bg-subtle p-3 max-md:hidden">
      <Heading size="small" className="HistorySidebar__heading pl-3 pt-2">
        Dine samtaler
      </Heading>

      {conversations.length > 0 && !isLoading && (
        <ol className="flex w-full list-none flex-col gap-0.5">
          {conversations
            .slice()
            .reverse()
            .map((conversation) => (
              <li key={conversation.id}>
                <ConversationLink conversation={conversation} />
              </li>
            ))}
        </ol>
      )}
    </div>
  )
}

export default HistorySidebar
