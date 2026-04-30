import { FileSearchIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, Heading, HStack, Loader, Skeleton, VStack } from "@navikt/ds-react"
import React, { memo, useEffect, useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { BobRoboHead } from "../../../../../assets/illustrations/BobRoboHead.tsx"
import { Message, NewMessage } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { AppMarkdown } from "../../../../../utils/AppMarkdown.tsx"
import { md } from "../../../../../utils/markdown.ts"
import { FollowUpQuestions } from "../../../followupquestions/FollowUpQuestions.tsx"
import BobSuggests from "../../suggestions/BobSuggests.tsx"

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

/* const options = ["Sitater fra Kunnskapsbasen", "Sitater fra Nav.no"] */

interface CitationSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  "data-citation"?: string
  "data-position"?: string
}

const getSourcesComponent = (message: Message) => {
  const hasContext = message.context && Object.entries(message.context).length > 0
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

    const [citations, setCitations] = useState<{ citationId: string; position: number }[]>([])

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
                <LoadingContent status={message.status} />
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
                <HStack className='mb-6 flex-wrap-reverse items-center gap-4'>
                  <BobSuggests
                    message={message}
                    onSend={onSend}
                    isLastMessage={isLastMessage}
                  />
                  {getSourcesComponent(message)}
                </HStack>
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

const LoadingContent = ({ status }: { status: string[] | undefined }) => {
  if (status && status.length > 0) {
    return <StatusMessageContent status={status} />
  }

  return (
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
}

const StatusMessageContent = ({ status }: { status: string[] }) => {
  const statusMessage = status.at(0) ?? ""
  return (
    <HStack gap='space-8'>
      <Loader size='xsmall' />
      <BodyShort className='animate-pulse'>{statusMessage}</BodyShort>
    </HStack>
  )
}
const MessageContent = ({
  message,
  citations,
  setCitations,
  onSend,
}: {
  message: Message
  citations: { citationId: string; position: number }[]
  setCitations: React.Dispatch<
    React.SetStateAction<
      {
        citationId: string
        position: number
      }[]
    >
  >
  onSend: (message: NewMessage) => void
}) => {
  const divRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const root = divRef.current
      const selection = window.getSelection()
      if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) return
      if (!root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) return

      const fragment = selection.getRangeAt(0).cloneContents()

      const container = document.createElement("div")
      container.appendChild(fragment)

      const plain = (container.textContent ?? "").replace(/\s+([.,:;!?])/g, "$1")
      const html = container.innerHTML.replace(/\s+([.,:;!?])/g, "$1")

      e.clipboardData?.setData("text/plain", plain)
      e.clipboardData?.setData("text/html", html)

      e.preventDefault()
    }

    document.addEventListener("copy", handleCopy)
    return () => document.removeEventListener("copy", handleCopy)
  }, [])

  const addCitation = (citationId: string, position: number) => {
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

  const citationSpanComponent = (props: CitationSpanProps) => {
    const dataCitation = props["data-citation"]
    const dataPosition = props["data-position"]
    if (dataCitation && dataPosition) {
      const citationId = dataCitation
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
  }

  return (
    <div
      className='mb-2 flex flex-col gap-3'
      ref={divRef}
    >
      <Heading
        size='small'
        className='sr-only top-0 select-none'
        level='2'
      >
        Svar fra Bob:
      </Heading>
      <BodyLong as='div'>
        <AppMarkdown
          remarkPlugins={[md.remarkCitations]}
          rehypePlugins={[rehypeRaw]}
          components={{ span: citationSpanComponent }}
        >
          {message.content}
        </AppMarkdown>
      </BodyLong>

      {Object.entries(message.context).length === 0 &&
        message.citations.length === 0 &&
        message.contextualizedQuestion !== null && (
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
  citations: { citationId: string; position: number }[]
  showLinks: boolean
}

const Citations = memo(
  ({ message, citations, showLinks }: CitationsProps) => {
    /*
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
        const matchingContext = message.context[citation.sourceId]!

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

      */

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
        {/*
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
          */}
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
