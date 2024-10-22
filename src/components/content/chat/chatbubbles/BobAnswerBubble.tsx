import {
  BodyLong,
  CopyButton,
  HStack,
  ReadMore,
  Skeleton,
  VStack,
} from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import Bobhead from "../../../../assets/Bob-hode-svg.svg"
import { Message } from "../../../../types/Message.ts"
import FeedbackButtons from "../../feedback/FeedbackButtons.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
}

export const BobAnswerBubble = ({ message }: BobAnswerBubbleProps) => {
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(true)

  return (
    <VStack gap='1' align='stretch'>
      <HStack gap='3' align='start' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='35px' />
        <div className='flex flex-col gap-3 pt-3'>
          <div className='flex w-full'>
            {/*TODO: fikse slik at skeleton strekker seg hele bredden*/}
            {message.content === "" ? (
              <div className='w-full'>
                <Skeleton width='100%' variant='text' />
                <Skeleton width='60' variant='text' />
              </div>
            ) : (
              <BodyLong>
                <Markdown className='markdown'>{message.content}</Markdown>
              </BodyLong>
            )}
          </div>
          <div className='flex flex-col pb-12'>
            {isReadMoreOpen && (
              <div className='mb-8 flex flex-grow justify-start'>
                <CopyButton copyText={message.content} size='small' />
                <FeedbackButtons message={message} />
              </div>
            )}
            {message.citations && message.citations.length > 0 && (
              <ReadMore
                header='Sitater fra kunnskapsbasen'
                defaultOpen={true}
                onOpenChange={setIsReadMoreOpen}
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
            {!isReadMoreOpen && (
              <div className='mt-4 flex flex-grow justify-start'>
                <FeedbackButtons message={message} />
                <CopyButton copyText={message.content} size='small' />
              </div>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  )
}
