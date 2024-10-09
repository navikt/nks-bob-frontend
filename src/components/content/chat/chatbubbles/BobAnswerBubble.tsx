import { Chat, Heading, HStack, Skeleton, VStack } from "@navikt/ds-react"

import Markdown from "react-markdown"
import Bobhead from "../../../../assets/Bob-hode-svg.svg"
import { Message } from "../../../../types/Message.ts"
import FeedbackButtons from "../../feedback/FeedbackButtons.tsx"
import BobAnswerCitation from "./BobAnswerCitation.tsx"

interface BobAnswerBubbleProps {
  message: Message
}

export const BobAnswerBubble = ({ message }: BobAnswerBubbleProps) => {
  return (
    <VStack gap='3' align='stretch'>
      <HStack gap='3' align='end' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='50px' className='hidehead' />
        <Chat.Bubble className='w-full bg-bg-default'>
          {message.content === "" ? (
            <>
              <Skeleton width='100%' variant='text' />
              <Skeleton width='100%' variant='text' />
              <Skeleton width={80} variant='text' />
            </>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </Chat.Bubble>
      </HStack>
      <FeedbackButtons message={message} />
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
