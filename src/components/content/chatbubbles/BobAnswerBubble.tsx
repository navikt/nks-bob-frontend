import { Chat, Heading, HStack, VStack } from "@navikt/ds-react"

import Markdown from "react-markdown"
import Bobhead from "../../../assets/Bob-hode-svg.svg"
import { Message } from "../../../types/Message"
import FeedbackButtons from "../feedback/FeedbackButtons.tsx"
import BobAnswerCitation from "./BobAnswerCitation.tsx"

interface BobAnswerBubbleProps {
  answer: Message
}

export const BobAnswerBubble = ({ answer }: BobAnswerBubbleProps) => {
  return (
    <VStack gap='3' align='end'>
      <HStack gap='3' align='end' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='50px' className='hidehead' />
        <Chat.Bubble className='bg-bg-default'>
          <Markdown>{answer.content}</Markdown>
        </Chat.Bubble>
      </HStack>
      <FeedbackButtons />
      {answer.citations?.length > 0 && (
        <VStack gap='3' align='stretch' className='pl-16'>
          <Heading as='h5' size='xsmall'>
            Sitater hentet fra kunnskapsartiklene
          </Heading>
          {answer.citations.map((citation) => (
            <BobAnswerCitation citation={citation} key={citation.id} />
          ))}
        </VStack>
      )}
    </VStack>
  )
}

export const BobAnswerMock = () => {
  return (
    <VStack gap='3' align='end'>
      <HStack gap='3' align='end' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='50px' className='hidehead' />
        <Chat.Bubble className='bg-bg-default'>
          <Markdown>
            Dette er bare en test, så du får se hvordan dette ser ut. Du kan
            selv bestemme lengden på teksten, men det er helt opp til deg når du
            skal slutte.
          </Markdown>
        </Chat.Bubble>
      </HStack>
      <FeedbackButtons />
    </VStack>
  )
}
