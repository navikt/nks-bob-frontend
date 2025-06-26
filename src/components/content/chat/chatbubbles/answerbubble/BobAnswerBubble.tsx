import {
  BodyLong,
  Skeleton,
  VStack,
} from "@navikt/ds-react"
import React, { memo, useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { BobRoboHead } from "../../../../../assets/illustrations/BobRoboHead.tsx"
import {
  Citation,
  Message,
  NewMessage,
} from "../../../../../types/Message.ts"
import { md } from "../../../../../utils/markdown.ts"
import BobSuggests from "../../suggestions/BobSuggests.tsx"
import BobAnswerCitations from "../BobAnswerCitations.tsx"
import ToggleCitations from "../citations/ToggleCitations.tsx"
import { CitationLinks, CitationNumber } from "./Citations.tsx"

interface BobAnswerBubbleProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLoading: boolean
  isLastMessage: boolean
  isHighlighted: boolean
}

const options = ["Sitater fra Nav.no", "Sitater fra Kunnskapsbasen"]

export const BobAnswerBubble = memo(
  ({
    message,
    onSend,
    isLoading,
    isLastMessage,
    isHighlighted,
  }: BobAnswerBubbleProps) => {
    const hasError = ({ errors, pending, content }: Message): boolean =>
      errors.length > 0 && !pending && content === ""

    const isPending = ({ pending, content }: Message): boolean =>
      pending && content === ""

    const [citations, setCitations] = useState<
      { citationId: number; position: number }[]
    >([])

    return (
      <VStack gap='1' align='stretch' className='pb-12'>
        <VStack align='start' width='full'>
          <div className='pt-1'>
            <BobRoboHead />
          </div>
          <div className='flex w-full flex-col pt-3'>
            <div
              className={`overflow-wrap mb-2 flex w-full ${isHighlighted ? "bg-[#FFF5E4] p-2" : ""}`}
            >
              {hasError(message) ? (
                <ErrorContent message={message} />
              ) : isPending(message) ? (
                <LoadingContent />
              ) : (
                <MessageContent message={message} citations={citations} setCitations={setCitations} />
              )}
            </div>
            <div className='flex flex-col'>
              <Citations
                message={message}
                onSend={onSend}
                isLoading={isLoading}
                isLastMessage={isLastMessage}
                citations={citations}
              />
            </div>
          </div>
        </VStack>
      </VStack>
    )
  },
  (prevProps, nextProps) => {
    const prevMessage = prevProps.message
    const nextMessage = nextProps.message

    if (prevProps.isLoading && !nextProps.isLoading) {
      return false
    }

    if (prevProps.isHighlighted !== nextProps.isHighlighted) {
      return false
    }

    return prevMessage === nextMessage
  },
)

const ErrorContent = ({ message }: { message: Message }) => (
  <BodyLong>
    <Markdown>
      {message.errors
        .map((error) => `**${error.title}:** ${error.description}`)
        .join("\n\n")}
    </Markdown>
  </BodyLong>
)

const LoadingContent = () => (
  <div className='w-full'>
    <Skeleton width='100%' variant='text' />
    <Skeleton width='70%' variant='text' />
  </div>
)

const MessageContent = ({ message, citations, setCitations }: {
  message: Message
  citations: { citationId: number; position: number } []
  setCitations: React.Dispatch<React.SetStateAction< {
    citationId: number
    position: number
  }[]>> }) => {

  const addCitation = (citationId: number, position: number) => {
    let existingCitations = citations
    const newCitation = { citationId, position }

    const existingCitation = citations.find(
      (citation) => citation.citationId === citationId,
    )

    if (existingCitation) {
      if (existingCitation.position <= position) {
        return
      }
      // Ignore existing citation to overwrite it.
      existingCitations = citations.filter(
        (citation) => citation.citationId !== citationId,
      )
    }

    // Store citations as a list ordered by `position`
    const newState = [...existingCitations, newCitation].sort(
      (a, b) => a.position - b.position,
    )
    setCitations(newState)
  }

  return (
    <VStack gap='5'>
      <BodyLong className='fade-in'>
        <Markdown
          className='markdown'
          remarkPlugins={[md.remarkCitations]}
          rehypePlugins={[rehypeRaw]}
          components={{
            a: ({ ...props }) => (
              <a {...props} target='_blank' rel='noopener noreferrer' />
            ),
            span: ({ node, ...props }) => {
              const dataCitation: string = (props as any)?.["data-citation"]
              const dataPosition: string = (props as any)?.["data-position"]

              if (dataCitation && dataPosition) {
                const citationId = parseInt(dataCitation)
                addCitation(citationId, parseInt(dataPosition))

                return (
                  <CitationNumber
                    citations={citations}
                    citationId={citationId}
                    context={message.context}
                  />
                )
              }
              return <span {...props} />
            },
          }}
        >
          {message.content}
        </Markdown>
      </BodyLong>
    </VStack>
  )
}

interface CitationsProps extends Omit<BobAnswerBubbleProps, "isHighlighted"> {
  citations: { citationId: number; position: number }[]
}

const Citations = memo(
  ({
    message,
    onSend,
    isLoading,
    isLastMessage,
    citations,
  }: CitationsProps ) => {
    const [selectedCitations, setSelectedCitations] =
      useState<string[]>(options)

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

    const citationData = filteredCitations
      .map((citation) => {
        const matchingContext = message.context.at(citation.sourceId)!

        return {
          title: matchingContext.title,
          source: matchingContext.source,
          citation,
        }
      })
      .reduce(
        (acc, { title, source, citation }) => {
          const existingGroup = acc.find((group) => group.title === title)

          if (existingGroup) {
            existingGroup.citations.push(citation)
          } else {
            acc.push({ title, source, citations: [citation] })
          }

          return acc
        },
        [] as {
          title: string
          source: "navno" | "nks"
          citations: Citation[]
        }[],
      )

    return (
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap gap-2'>
          {(!isLoading || !isLastMessage) && (
            <BobSuggests
              message={message}
              onSend={onSend}
              isLastMessage={isLastMessage}
            />
          )}
          <CitationLinks citations={citations} context={message.context} />
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className='fade-in flex flex-col gap-2'>
            <ToggleCitations
              onToggle={handleToggleCitations}
              message={message}
            />
            {citationData.map((citation, index) => (
              <BobAnswerCitations
                citation={citation}
                key={`citation-${index}`}
                context={message.context}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    const prevCitations = prevProps.message.citations
    const nextCitations = nextProps.message.citations

    if (prevProps.isLoading !== nextProps.isLoading) {
      return false
    }

    if (prevProps.isLastMessage !== nextProps.isLastMessage) {
      return false
    }

    if (prevCitations.length === nextCitations.length) {
      return true
    }

    return prevCitations === nextCitations
  },
)

