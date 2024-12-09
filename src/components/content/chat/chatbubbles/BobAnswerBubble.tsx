import { BodyLong, HStack, ReadMore, Skeleton, VStack } from "@navikt/ds-react"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import Bobhead from "../../../../assets/illustrations/Bob-hode-svg.svg"
import { Message, NewMessage } from "../../../../types/Message.ts"
import BobSuggests from "../suggestions/BobSuggests.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"
import amplitude from "../../../../utils/amplitude.ts"

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

  const readMoreOpenOnChange = (value: boolean) => {
    value
      ? amplitude.kildeAccordionÅpnet()
      : amplitude.kildeAccordionSkjult()

    setIsReadMoreOpen(value)
  }

  return (
    <VStack gap='1' align='stretch' className='pb-12'>
      <HStack gap='1' align='start' wrap={false} width='full'>
        <img src={Bobhead} alt='Bob' width='30px' className='bobhead' />
        <div className='flex w-full flex-col pt-3'>
          <div className='overflow-wrap mb-4 flex w-full'>
            {message.content === "" ? (
              <div className='w-full'>
                <Skeleton width='100%' variant='text' />
                <Skeleton width='70%' variant='text' />
              </div>
            ) : (
              <BodyLong className='fade-in'>
                <Markdown
                  className='markdown'
                  components={{
                    a: ({ ...props }) => (
                      <a {...props} target='_blank' rel='noopener noreferrer' />
                    ),
                  }}
                >
                  {message.content}
                </Markdown>
              </BodyLong>
            )}
          </div>
          <div className='flex flex-col'>
            {(!isLoading || !isLastMessage) && (
              <BobSuggests
                message={message}
                onSend={onSend}
                isLastMessage={isLastMessage}
              />
            )}

            <div ref={readMoreRef} />
            {message.citations && message.citations.length > 0 && (
              <ReadMore
                header='Sitater fra kunnskapsbasen'
                defaultOpen={true}
                onOpenChange={readMoreOpenOnChange}
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
