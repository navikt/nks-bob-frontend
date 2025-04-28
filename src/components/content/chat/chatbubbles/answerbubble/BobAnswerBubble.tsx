import { ExternalLinkIcon } from "@navikt/aksel-icons"
import {
  BodyLong,
  Button,
  Heading,
  Link,
  Popover,
  Skeleton,
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
import BobAnswerCitations from "../BobAnswerCitations.tsx"
import ToggleCitations from "../citations/ToggleCitations.tsx"

interface BobAnswerBubbleProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLoading: boolean
  isLastMessage: boolean
}

const options = ["Sitater fra Nav.no", "Sitater fra Kunnskapsbasen"]

export const BobAnswerBubble = memo(
  ({ message, onSend, isLoading, isLastMessage }: BobAnswerBubbleProps) => {
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
            <div className='overflow-wrap mb-2 flex w-full'>
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

const MessageContent = ({ message }: { message: Message }) => (
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
          const citationId = (props as any)?.["data-citation"]
          if (citationId) {
            return <CitationNumber id={citationId} context={message.context} />
          }
          return <span {...props} />
        },
      }}
    >
      {message.content}
    </Markdown>
  </BodyLong>
)

const Citations = memo(
  ({ message, onSend, isLoading, isLastMessage }: BobAnswerBubbleProps) => {
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

const CitationNumber = ({
  id,
  context,
}: {
  id: number
  context: Context[]
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [openState, setOpenState] = useState(false)

  const source = context.at(id)
  if (!context || !source) {
    return null
  }

  const title =
    source.source === "nks"
      ? source.title
      : `${source.title} / ${source.anchor}`

  return (
    <>
      <sup>
        <Button
          variant='tertiary'
          size='xsmall'
          ref={buttonRef}
          onClick={() => setOpenState(!openState)}
          aria-expanded={openState}
        >
          {id}
        </Button>
      </sup>

      <Popover
        open={openState}
        onClose={() => setOpenState(false)}
        anchorEl={buttonRef.current}
        arrow={false}
        className='max-w-xl'
      >
        <Popover.Content className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <Heading size='xsmall'>{title}</Heading>
            <Link href={`${source.url}#${source.anchor}`} target='_blank'>
              <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
            </Link>
          </div>
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
        </Popover.Content>
      </Popover>
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
          value: `<span data-citation="${id}"></span>`,
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
