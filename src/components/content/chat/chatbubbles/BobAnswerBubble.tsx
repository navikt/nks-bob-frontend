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
import rehypeRaw from "rehype-raw"
import Bobhead from "../../../../assets/illustrations/Bob-hode-svg.svg"
import { Message, NewMessage } from "../../../../types/Message.ts"
import FeedbackButtons from "../feedback/FeedbackButtons.tsx"
import BobSuggests from "../suggestions/BobSuggests.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLoading: boolean
  isLastMessage: boolean
}

export const BobAnswerBubble = ({
  message,
  onSend,
  isLoading,
  isLastMessage,
}: BobAnswerBubbleProps) => {
  const readMoreRef = useRef<HTMLDivElement | null>(null)
  const [isReadMoreOpen, setIsReadMoreOpen] = useState<boolean | null>(false)

  useEffect(() => {
    if (isReadMoreOpen && readMoreRef.current) {
      readMoreRef.current.scrollIntoView({
        behavior: "smooth",
      })
    }
  }, [isReadMoreOpen])

  const bobAnswer = message.content.replace(/\n\n/g, "<br><br>")

  return (
    <VStack gap='1' align='stretch' className='pb-12'>
      <HStack gap='3' align='start' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='35px' />
        <div className='flex w-full flex-col pt-3'>
          <div className='mb-2 flex w-full'>
            {message.content === "" ? (
              <div className='w-full'>
                <Skeleton width='100%' variant='text' />
                <Skeleton width='70%' variant='text' />
              </div>
            ) : (
              <BodyLong>
                <Markdown className='markdown' rehypePlugins={[rehypeRaw]}>
                  {bobAnswer}
                </Markdown>
              </BodyLong>
            )}
          </div>
          <div className='flex flex-col'>
            <div className='mb-6 flex flex-col justify-start'>
              {(!isLoading || !isLastMessage) && (
                <BobSuggests
                  message={message}
                  onSend={onSend}
                  isLastMessage={isLastMessage}
                />
              )}
              <div className='ml-[-0.3rem] flex flex-grow items-center justify-start'>
                <CopyButton copyText={message.content} size='small' />
                <FeedbackButtons message={message} />
              </div>
            </div>

            <div ref={readMoreRef} />
            {message.citations && message.citations.length > 0 && (
              <ReadMore
                header='Sitater fra kunnskapsbasen'
                defaultOpen={true}
                onOpenChange={setIsReadMoreOpen}
                className='readmore-styling fade-in-citations'
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
