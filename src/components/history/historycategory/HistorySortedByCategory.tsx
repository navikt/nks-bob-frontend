import { Heading } from "@navikt/ds-react"
import { isToday, isYesterday, subDays } from "date-fns"
import { useConversations } from "../../../api/api"
import { Conversation } from "../../../types/Message"
import ConversationLink from "../conversationlink/ConversationLink"

const filterConversations = (
  conversations: Conversation[],
  byDate: (conversation: Conversation) => boolean,
) => {
  return conversations.filter(byDate).map((conversation: Conversation) => (
    <li key={conversation.id}>
      <ConversationLink conversation={conversation} />
    </li>
  ))
}

export const TodayConversations = () => {
  const { conversations = [] } = useConversations()
  const todayConversations = filterConversations(
    conversations,
    (conversation: Conversation) => isToday(new Date(conversation.createdAt)),
  )
  return todayConversations.length > 0 ? (
    <div className="flex flex-col">
      <Heading size="xsmall" className="mb-2 pl-3 pt-2">
        I dag
      </Heading>
      <ol>{todayConversations}</ol>
    </div>
  ) : null
}

export const YesterdayConversations = () => {
  const { conversations = [] } = useConversations()
  const yesterdayConversations = filterConversations(
    conversations,
    (conversation) => isYesterday(new Date(conversation.createdAt)),
  )
  return yesterdayConversations.length > 0 ? (
    <div className="flex flex-col">
      <Heading size="xsmall" className="mb-2 pl-3 pt-2">
        I dag
      </Heading>
      <ol>{yesterdayConversations}</ol>
    </div>
  ) : null
}

export const Last7DaysConversations = () => {
  const { conversations = [] } = useConversations()
  const last7DaysConversations = filterConversations(
    conversations,
    (conversation) => {
      const conversationDate = new Date(conversation.createdAt)
      return (
        conversationDate >= subDays(new Date(), 7) &&
        !isToday(conversationDate) &&
        !isYesterday(conversationDate)
      )
    },
  )
  return last7DaysConversations.length > 0 ? (
    <div className="flex flex-col">
      <Heading size="xsmall" className="mb-2 pl-3 pt-2">
        Siste 7 dagene
      </Heading>
      <ol>{last7DaysConversations}</ol>
    </div>
  ) : null
}

export const Last30DaysConversations = () => {
  const { conversations = [] } = useConversations()
  const last30DaysConversations = filterConversations(
    conversations,
    (conversation) => {
      const conversationDate = new Date(conversation.createdAt)
      return (
        conversationDate >= subDays(new Date(), 30) &&
        conversationDate < subDays(new Date(), 7)
      )
    },
  )
  return last30DaysConversations.length > 0 ? (
    <div className="flex flex-col">
      <Heading size="xsmall" className="mb-2 pl-3 pt-2">
        Siste 30 dagene
      </Heading>
      <ol>{last30DaysConversations}</ol>
    </div>
  ) : null
}

export const Before30DaysConversations = () => {
  const { conversations = [] } = useConversations()
  const before30DaysConversations = filterConversations(
    conversations,
    (conversation: Conversation) => {
      return new Date(conversation.createdAt) < subDays(new Date(), 30)
    },
  )
  return before30DaysConversations.length > 0 ? (
    <div className="flex flex-col">
      <ol>{before30DaysConversations}</ol>
    </div>
  ) : null
}
