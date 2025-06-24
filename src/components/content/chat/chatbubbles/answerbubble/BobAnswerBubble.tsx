import { ExternalLinkIcon } from "@navikt/aksel-icons"
import {
  BodyLong,
  Box,
  Heading,
  HStack,
  Link,
  Skeleton,
  Tag,
  VStack,
} from "@navikt/ds-react"
import { Root, Text } from "mdast"
import { memo, useRef, useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { Plugin } from "unified"
import { visit } from "unist-util-visit"
import { BobRoboHead } from "../../../../../assets/illustrations/BobRoboHead.tsx"
import {
  Citation,
  Context,
  Message,
  NewMessage,
} from "../../../../../types/Message.ts"
import BobSuggests from "../../suggestions/BobSuggests.tsx"
import BobAnswerCitations, { SourceIcon } from "../BobAnswerCitations.tsx"
import ToggleCitations from "../citations/ToggleCitations.tsx"
import React from "react"

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
                <MessageContent message={message} />
              )}
            </div>
            <div className='flex flex-col'>
              <Citations
                message={message}
                onSend={onSend}
                isLoading={isLoading}
                isLastMessage={isLastMessage}
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

const MessageContent = ({ message }: { message: Message }) => {
  const [citations, setCitations] = useState<
    { citationId: number; position: number }[]
  >([])

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
    const before = existingCitations.filter(
      (citation) => citation.position <= position,
    )
    const after = existingCitations.filter(
      (citation) => citation.position > position,
    )
    setCitations([...before, newCitation, ...after])
  }

  return (
    <VStack gap='5'>
      <BodyLong className='fade-in'>
        <Markdown
          className='markdown'
          remarkPlugins={[remarkCitations]}
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
      <CitationLinks citations={citations} context={message.context} />
    </VStack>
  )
}

const Citations = memo(
  ({
    message,
    onSend,
    isLoading,
    isLastMessage,
  }: Omit<BobAnswerBubbleProps, "isHighlighted">) => {
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

const CitationLinks = ({
  citations,
  context,
}: {
  citations: { citationId: number }[]
  context: Context[]
}) => {
  return (
    <VStack gap='2' justify='center'>
      {citations.map(({ citationId }) => (
        <CitationLink
          citations={citations}
          citationId={citationId}
          context={context}
        />
      ))}
    </VStack>
  )
}

const CitationLink = ({
  citations,
  citationId,
  context,
}: {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
}) => {
  const source = context.at(citationId)
  if (!context || !source) {
    return null
  }

  const title =
    source.source === "nks"
      ? source.title
      : `${source.title} / ${source.anchor}`

  const displayId =
    citations.findIndex((citation) => citation.citationId === citationId) + 1

  return (
    <HStack gap='2' align='center'>
      <Tag variant='neutral' size='xsmall'>
        {displayId}
      </Tag>
      <Link
        href={`${source.url}#${source.anchor}`}
        target='_blank'
        title='Åpne artikkelen i ny fane'
      >
        {title}
        <ExternalLinkIcon />
      </Link>
    </HStack>
  )
}

const CitationNumber = ({
  citations,
  citationId,
  context,
}: {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
}) => {
  const source = context.at(citationId)
  if (!context || !source) {
    return null
  }

  const title =
    source.source === "nks"
      ? source.title
      : `${source.title} / ${source.anchor}`

  const displayId =
    citations.findIndex((citation) => citation.citationId === citationId) + 1

  const hoverContent = (
    <div className='flex flex-col gap-4'>
      <VStack gap='1'>
        <div className='flex justify-between'>
          <Heading size='xsmall'>{title}</Heading>
          <Link href={`${source.url}#${source.anchor}`} target='_blank'>
            <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
          </Link>
        </div>
        <SourceIcon source={source.source} />
      </VStack>
      <BodyLong size='small'>
        <Markdown
          className='markdown'
          components={{
            a: ({ ...props }) => (
              <a {...props} target='_blank' rel='noopener noreferrer' />
            ),
          }}
        >
          {source.content}
        </Markdown>
      </BodyLong>
    </div>
  )

  return (
    <sup>
      <HoverCard content={hoverContent}>
        <Tag variant='neutral' size='xsmall' className='m-1'>
          {displayId}
        </Tag>
      </HoverCard>
    </sup>
  )
}

interface HoverCardProps {
  children: React.ReactNode
  content: React.ReactNode
}

const HoverCard = ({ children, content }: HoverCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, maxHeight: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  const handleMouseEnter = (_e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom - 8 - 20 // 8px offset + 20px margin
      
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
        maxHeight: Math.max(200, spaceBelow), // Minimum 200px height
      })
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleCardMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {isOpen && (
        <div
          ref={cardRef}
          className='fixed z-50 max-w-xl'
          style={{
            left: position.x,
            top: position.y,
            transform: "translateX(-50%)",
            maxHeight: position.maxHeight,
          }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <Box
            background='surface-default'
            padding='4'
            borderRadius='medium'
            borderColor='border-subtle'
            borderWidth='1'
            shadow='medium'
            className='overflow-y-auto'
            style={{ maxHeight: 'inherit' }}
          >
            {content}
          </Box>
        </div>
      )}
    </>
  )
}

const remarkCitations: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent) return

      const citationRegex = /\[(\d)\]/g
      const value = node.value

      let match
      let lastIndex = 0
      const newNodes: any[] = []

      while ((match = citationRegex.exec(value)) !== null) {
        const [fullMatch, id] = match
        const start = match.index

        if (start > lastIndex) {
          newNodes.push({
            type: "text",
            value: value.slice(lastIndex, start),
          })
        }

        newNodes.push({
          type: "html",
          value: `<span data-citation="${id}" data-position="${start}"></span>`,
        })

        lastIndex = start + fullMatch.length
      }

      if (lastIndex < value.length) {
        newNodes.push({
          type: "text",
          value: value.slice(lastIndex),
        })
      }

      parent.children.splice(index!, 1, ...newNodes)
    })
  }
}
