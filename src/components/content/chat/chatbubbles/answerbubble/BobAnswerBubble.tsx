import { FileSearchIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, Heading, Skeleton, VStack } from "@navikt/ds-react"
import React, { memo, useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { BobRoboHead } from "../../../../../assets/illustrations/BobRoboHead.tsx"
import { Citation, Message, NewMessage } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { md } from "../../../../../utils/markdown.ts"
import { FollowUpQuestions } from "../../../followupquestions/FollowUpQuestions.tsx"
import BobSuggests from "../../suggestions/BobSuggests.tsx"
import BobAnswerCitations from "../BobAnswerCitations.tsx"
import ToggleCitations from "../citations/ToggleCitations.tsx"
import { NoSourcesNeeded, ShowAllSourcesToggle } from "../sources/ShowAllSources.tsx"
import { CitationLinks, CitationNumber } from "./Citations.tsx"

interface BobAnswerBubbleProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLoading: boolean
  isLastMessage: boolean
  isHighlighted: boolean
  followUp: string[]
}

const options = ["Sitater fra Kunnskapsbasen", "Sitater fra Nav.no"]

interface CitationSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  "data-citation"?: string
  "data-position"?: string
}

const getSourcesComponent = (message: Message) => {
  const hasContext = message.context && message.context.length > 0
  const hasCitations = message.citations && message.citations.length > 0

  if (!hasContext && !hasCitations) {
    return <NoSourcesNeeded />
  }

  if (hasContext) {
    return (
      <ShowAllSourcesToggle
        message={message}
        toggleTitle='Vis alle kilder'
      />
    )
  }

  return <NoSourcesNeeded />
}

export const BobAnswerBubble = memo(
  ({ message, onSend, isLoading, isLastMessage, isHighlighted, followUp }: BobAnswerBubbleProps) => {
    const hasError = ({ errors, pending, content }: Message): boolean => errors.length > 0 && !pending && content === ""

    const isPending = ({ pending, content }: Message): boolean => pending && content === ""

    const [citations, setCitations] = useState<{ citationId: number; position: number }[]>([])

    const contentReady = !hasError(message) && !isPending(message) && !!message.content

    return (
      <VStack
        gap='space-4'
        align='stretch'
        className={`pb-14 ${isLastMessage ? "min-h-[calc(100vh-250px)]" : ""}`}
      >
        <VStack
          align='start'
          width='full'
        >
          <div className='pt-1'>
            <BobRoboHead />
          </div>
          <div className='flex w-full flex-col pt-3'>
            <div className={`overflow-wrap mb-2 flex w-full ${isHighlighted ? "bg-ax-bg-brand-beige-soft p-2" : ""} `}>
              {hasError(message) ? (
                <ErrorContent message={message} />
              ) : isPending(message) ? (
                <LoadingContent />
              ) : (
                <MessageContent
                  message={message}
                  citations={citations}
                  setCitations={setCitations}
                  onSend={onSend}
                />
              )}
            </div>
            {contentReady && message.content && (
              <>
                <div className='mb-6 flex items-center gap-2'>
                  <BobSuggests
                    message={message}
                    onSend={onSend}
                    isLastMessage={isLastMessage}
                  />
                  {getSourcesComponent(message)}
                </div>
                <Citations
                  message={message}
                  onSend={onSend}
                  isLoading={isLoading}
                  isLastMessage={isLastMessage}
                  citations={citations}
                  showLinks={contentReady}
                />
                <FollowUpQuestions
                  followUp={followUp}
                  onSend={(question) => onSend({ content: question })}
                  className='pointer-events-auto'
                />
              </>
            )}
          </div>
        </VStack>
      </VStack>
    )
  },
  (prevProps, nextProps) => {
    if (prevProps.isLoading && !nextProps.isLoading) return false
    if (prevProps.isHighlighted !== nextProps.isHighlighted) return false
    if (prevProps.isLastMessage !== nextProps.isLastMessage) return false

    return prevProps.message === nextProps.message
  },
)

const ErrorContent = ({ message }: { message: Message }) => (
  <BodyLong>
    <Markdown>{message.errors.map((error) => `**${error.title}:** ${error.description}`).join("\n\n")}</Markdown>
  </BodyLong>
)

const LoadingContent = () => (
  <div className='w-full'>
    <Skeleton
      width='100%'
      variant='text'
    />
    <Skeleton
      width='70%'
      variant='text'
    />
  </div>
)

const MessageContent = ({
  message,
  citations,
  setCitations,
  onSend,
}: {
  message: Message
  citations: { citationId: number; position: number }[]
  setCitations: React.Dispatch<
    React.SetStateAction<
      {
        citationId: number
        position: number
      }[]
    >
  >
  onSend: (message: NewMessage) => void
}) => {
  const divRef = React.useRef<HTMLDivElement>(null)
  divRef.current?.addEventListener("copy", (e) => {
    const messageLength = md.toPlaintext(message.content).length
    const copyLength = window.getSelection()?.toString().length ?? 0

    analytics.svartekstMarkert(copyLength / messageLength)
    e.stopImmediatePropagation()
  })

  const addCitation = (citationId: number, position: number) => {
    let existingCitations = citations
    const newCitation = { citationId, position }

    const existingCitation = citations.find((citation) => citation.citationId === citationId)

    if (existingCitation) {
      if (existingCitation.position <= position) {
        return
      }
      // Ignore existing citation to overwrite it.
      existingCitations = citations.filter((citation) => citation.citationId !== citationId)
    }

    // Store citations as a list ordered by `position`
    const newState = [...existingCitations, newCitation].sort((a, b) => a.position - b.position)
    setCitations(newState)
  }

  function handleFindSourcesClick() {
    analytics.svarEndret("punktliste")
    const findSources: NewMessage = {
      content: `Se om du kan finne kilder som støtter svaret:\n${message.content}`,
    }
    onSend(findSources)
  }

  return (
    <div
      className='mb-2 flex flex-col gap-3'
      ref={divRef}
    >
      <Heading
        size='small'
        className='sr-only top-0'
        level='2'
      >
        Svar fra Bob:
      </Heading>
      {!message.pending && message.citations.length === 0 && message.context.length > 0 && (
        <BodyShort>
          Jeg fant kilder, men <strong>de inneholdt ikke informasjon som kunne svare på spørsmålet</strong>. Likevel
          skal jeg forsøke å svare så godt som mulig:
        </BodyShort>
      )}
      <Markdown
        className='markdown answer-markdown'
        remarkPlugins={[remarkGfm, md.remarkCitations]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target='_blank'
              rel='noopener noreferrer'
              title='Åpne lenken i ny fane'
            />
          ),
          span: (props: CitationSpanProps) => {
            const dataCitation = props["data-citation"]
            const dataPosition = props["data-position"]
            if (dataCitation && dataPosition) {
              const citationId = parseInt(dataCitation, 10)
              addCitation(citationId, parseInt(dataPosition, 10))
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
      {message.context.length === 0 && message.citations.length === 0 && message.contextualizedQuestion !== null && (
        <Button
          data-color='neutral'
          size='small'
          variant='tertiary'
          className='my-3 w-fit'
          icon={<FileSearchIcon fontSize={24} />}
          onClick={handleFindSourcesClick}
        >
          Forsøk å finne kilder som støtter svaret
        </Button>
      )}
    </div>
  )
}

interface CitationsProps extends Omit<BobAnswerBubbleProps, "isHighlighted" | "followUp"> {
  citations: { citationId: number; position: number }[]
  showLinks: boolean
}

const Citations = memo(
  ({ message, citations, showLinks }: CitationsProps) => {
    const [selectedCitations, setSelectedCitations] = useState<string[]>(options)

    const handleToggleCitations = (selected: string[]) => {
      setSelectedCitations(selected)
    }

    const filteredCitations = message.citations.filter((citation) => {
      if (selectedCitations.length === 0) {
        return false
      }
      return selectedCitations.some((selected) => {
        if (selected === "Sitater fra Kunnskapsbasen") {
          return message.context[citation.sourceId].source === "nks"
        }
        if (selected === "Sitater fra Nav.no") {
          return message.context[citation.sourceId].source === "navno"
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
      .sort((a, b) => {
        if (a.source === "nks" && b.source === "navno") return -1
        if (a.source === "navno" && b.source === "nks") return 1
        return 0
      })

    return (
      <div className='mb-4 flex flex-col gap-4'>
        {showLinks && citations.length > 0 && (
          <div className='flex flex-col gap-2'>
            <CitationLinks
              citations={citations}
              context={message.context}
            />
          </div>
        )}
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

    if (prevProps.isLoading !== nextProps.isLoading) return false
    if (prevProps.isLastMessage !== nextProps.isLastMessage) return false
    if (prevProps.citations !== nextProps.citations) return false
    if (prevProps.showLinks !== nextProps.showLinks) return false
    if (prevCitations === nextCitations) return true
    return prevCitations.length === nextCitations.length
  },
)
