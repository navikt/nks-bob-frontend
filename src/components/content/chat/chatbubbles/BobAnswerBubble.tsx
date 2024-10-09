import { Chat, Heading, HStack, Skeleton, VStack } from "@navikt/ds-react"

import Markdown from "react-markdown"
import { useMessages } from "../../../../api/api.ts"
import Bobhead from "../../../../assets/Bob-hode-svg.svg"
import { Conversation, Message } from "../../../../types/Message.ts"
import FeedbackButtons from "../../feedback/FeedbackButtons.tsx"
import BobAnswerCitation from "./BobAnswerCitation.tsx"

interface BobAnswerBubbleProps {
  conversationId: Conversation["id"]
  message: Message
}

export const BobAnswerBubble = ({
  message,
  conversationId,
}: BobAnswerBubbleProps) => {
  const { isLoading } = useMessages(conversationId)

  return (
    <VStack gap='3' align='stretch'>
      <HStack gap='3' align='end' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='50px' className='hidehead' />
        <Chat.Bubble className='w-full bg-bg-default'>
          {isLoading ? (
            <>
              <Skeleton variant='text' width='100%' height={20} />
              <Skeleton variant='text' width='70%' height={20} />
            </>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </Chat.Bubble>
      </HStack>
      <FeedbackButtons />
      {message.citations?.length > 0 && (
        <VStack gap='3' align='stretch' className='pl-16'>
          <Heading as='h5' size='xsmall'>
            Sitater hentet fra kunnskapsartiklene
          </Heading>
          {message.citations.map((citation) => (
            <BobAnswerCitation citation={citation} key={citation.id} />
          ))}
        </VStack>
      )}
    </VStack>
  )
}
