import { Heading } from "@navikt/ds-react"

import { Conversation } from "../../types/message"
import ConversationLink from "./ConversationLink"

import "./HistorySidebar.css"

function HistorySidebar() {
  //const { conversations, isLoading } = useConversations()

  /* Til testing *******************************/
  const conversations: Conversation[] = [
    {
      id: "123",
      title:
        "Første Conversation Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec blandit ipsum. " +
        "Nam sit amet tortor rhoncus, efficitur nisl non, porta nibh.",
      createdAt: "2024-07-22, 14:35",
      owner: "A111111",
    },
    {
      id: "456",
      title: "Andre Conversation",
      createdAt: "2024-08-12, 08:35",
      owner: "A111111",
    },
  ]
  const isLoading = false

  /*********************************************/

  return (
    <div className="HistorySidebar h-full w-full max-w-60 overflow-scroll bg-bg-subtle p-3 max-md:hidden">
      <Heading size="small" className="HistorySidebar__heading pl-3 pt-2">
        Dine samtaler
      </Heading>

      {conversations && conversations.length > 0 && !isLoading && (
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
