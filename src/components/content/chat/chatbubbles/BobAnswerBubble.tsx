import {
  BodyLong,
  CopyButton,
  HStack,
  ReadMore,
  Skeleton,
  VStack,
} from "@navikt/ds-react"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import Bobhead from "../../../../assets/illustrations/Bob-hode-svg.svg"
import { Message } from "../../../../types/Message.ts"
import FeedbackButtons from "../../feedback/FeedbackButtons.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
}

export const BobAnswerBubble = ({ message }: BobAnswerBubbleProps) => {
  const readMoreRef = useRef<HTMLDivElement | null>(null)
  const [isReadMoreOpen, setIsReadMoreOpen] = useState<boolean | null>(false)

  useEffect(() => {
    if (isReadMoreOpen && readMoreRef.current) {
      readMoreRef.current.scrollIntoView({
        behavior: "smooth",
      })
    }
  }, [isReadMoreOpen])

  return (
    <VStack gap='1' align='stretch'>
      <HStack gap='3' align='start' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='35px' />
        <div className='flex w-full flex-col gap-2 pt-3'>
          <div className='flex w-full'>
            {message.content === "" ? (
              <div className='w-full'>
                <Skeleton width='100%' variant='text' />
                <Skeleton width='70%' variant='text' />
              </div>
            ) : (
              <BodyLong>
                <Markdown className='markdown'>{message.content}</Markdown>
              </BodyLong>
            )}
          </div>
          <div className='flex flex-col pb-12'>
            <div className='mb-6 flex flex-grow justify-start'>
              <CopyButton copyText={message.content} size='small' />
              <FeedbackButtons message={message} />
            </div>
            <div ref={readMoreRef} />
            {message.citations && message.citations.length > 0 && (
              <ReadMore
                header='Sitater fra kunnskapsbasen'
                defaultOpen={true}
                onOpenChange={setIsReadMoreOpen}
                className='readmore-styling'
              >
                <div className='flex flex-col gap-2 pt-4'>
                  {message.citations.map((citation, index) => (
                    <BobAnswerCitations
                      citation={citation}
                      key={`citation-${index}`}
                      context={message.context}
                    />
                  ))}
                </div>
              </ReadMore>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  )
}
