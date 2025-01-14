import { BodyLong, HStack, Skeleton, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import BobHead from "../../../../assets/illustrations/BobHead.svg"
import { Message, NewMessage } from "../../../../types/Message.ts"
import BobSuggests from "../suggestions/BobSuggests.tsx"
import BobAnswerCitations from "./BobAnswerCitations.tsx"
import ToggleCitations from "./citations/ToggleCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLoading: boolean
  isLastMessage: boolean
}

const options = ["Sitater fra Nav.no", "Sitater fra Kunnskapsbasen"]

export const BobAnswerBubble = ({
  message,
  onSend,
  isLoading,
  isLastMessage,
}: BobAnswerBubbleProps) => {
  const [selectedCitations, setSelectedCitations] = useState<string[]>(options)

  const handleToggleCitations = (selected: string[]) => {
    setSelectedCitations(selected)
  }

  const filteredCitations = message.citations.filter((citation) => {
    if (selectedCitations.length === 0) {
      return false
    }
    return selectedCitations.some((selected) => {
      if (selected === "Sitater fra Nav.no") {
        return message.context[citation.sourceId].source === "navno"
      }
      if (selected === "Sitater fra Kunnskapsbasen") {
        return message.context[citation.sourceId].source === "nks"
      }
      return false
    })
  })

  return (
    <VStack gap='1' align='stretch' className='pb-12'>
      <HStack gap='1' align='start' wrap={false} width='full'>
        <img src={BobHead} alt='Bob' width='30px' className='bobhead' />
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
            {message.citations && message.citations.length > 0 && (
              <div className='fade-in flex flex-col gap-2'>
                <ToggleCitations
                  onToggle={handleToggleCitations}
                  message={message}
                />
                {filteredCitations.map((citation, index) => (
                  <BobAnswerCitations
                    citation={citation}
                    key={`citation-${index}`}
                    context={message.context}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </HStack>
    </VStack>
  )
}
