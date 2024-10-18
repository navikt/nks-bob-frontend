import {
  BodyLong,
  CopyButton,
  HStack,
  ReadMore,
  Skeleton,
  VStack,
} from "@navikt/ds-react"
import { useEffect, useRef } from "react"
import Markdown from "react-markdown"
import Bobhead from "../../../../assets/Bob-hode-svg.svg"
import { Message } from "../../../../types/Message.ts"
import FeedbackButtons from "../../feedback/FeedbackButtons.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
}

export const BobAnswerBubble = ({ message }: BobAnswerBubbleProps) => {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }) // sjekk om det kan være lurt å kjøre smooth på ny melding og instant når man henter alle
    }
  }, [message])

  return (
    <VStack gap='3' align='stretch' className='mb-14'>
      <HStack gap='2' align='start' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='35px' className='hidehead' />
        <div className='w-full pt-3'>
          {message.content === "" ? (
            <>
              <Skeleton width='100%' variant='text' />
              <Skeleton width='60%' variant='text' />
            </>
          ) : (
            <BodyLong>
              <Markdown className='markdown'>{message.content}</Markdown>
            </BodyLong>
          )}
        </div>
      </HStack>

      <div ref={lastMessageRef} />
      {message.citations?.length > 0 && (
        <ReadMore
          header='Fra kunnskapsartiklene'
          defaultOpen={true}
          className='pl-8'
        >
          <div className='flex flex-col gap-2 pt-4'>
            {message.citations.map((citation) => (
              <BobAnswerCitations
                citation={citation}
                key={citation.id}
                context={message.context}
              />
            ))}
          </div>
        </ReadMore>
      )}
      <div className='flex flex-grow justify-end'>
        <FeedbackButtons message={message} />
        <CopyButton copyText={message.content} size='small' />
      </div>
    </VStack>
  )
}
