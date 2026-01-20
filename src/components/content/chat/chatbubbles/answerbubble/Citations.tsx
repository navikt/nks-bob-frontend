import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, CopyButton, HStack, Label, Link, Tag, VStack } from "@navikt/ds-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Context } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { HoverCard } from "../../../../ui/HoverCard.tsx"
import { SourceIcon } from "../BobAnswerCitations.tsx"

interface CitationNumberProps {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
  tools: string[]
}

export const CitationNumber = ({ citations, citationId, context, tools }: CitationNumberProps) => {
  const source = context.at(citationId)
  if (!context || !source) {
    return null
  }

  const title =
    source.source === "nks"
      ? source.title
      : source.anchor !== null
        ? `${source.title} / ${source.anchor}`
        : source.title

  const displayId = citations.findIndex((citation) => citation.citationId === citationId) + 1

  const hoverContent = (
    <div className='flex flex-col gap-4'>
      <VStack gap='2'>
        <div className='mb-2 border-b border-border-subtle pb-3'>
          <SourceIcon source={source.source} />
        </div>
        <HStack
          align='center'
          gap='1'
        >
          <Link
            href={`${source.url}#${source.anchor}`}
            target='_blank'
            title='Åpne artikkelen i ny fane'
            onClick={() => {
              if (source.source === "nks") {
                analytics.kbModalLenkeKlikket(
                  {
                    kilde: source.source,
                    tittel: source.title,
                    artikkelKolonne: source.articleColumn,
                  },
                  {
                    kildeId: citationId,
                  },
                  tools,
                )
              } else if (source.source === "navno") {
                analytics.navModalLenkeKlikket(
                  {
                    kilde: source.source,
                    tittel: source.title,
                  },
                  {
                    kildeId: citationId,
                  },
                  tools,
                )
              }
            }}
          >
            <Label
              size='small'
              className='inline cursor-pointer'
            >
              {title}
            </Label>
          </Link>
          <CopyButton
            copyText={source.source === "nks" ? source.title : `${source.url}#${source.anchor}`}
            size='xsmall'
            onClick={() => {
              if (source.source === "nks") {
                analytics.kbModalLenkeKopiert(
                  {
                    kilde: source.source,
                    tittel: source.title,
                    artikkelKolonne: source.articleColumn,
                  },
                  {
                    kildeId: citationId,
                  },
                  tools,
                )
              } else if (source.source === "navno") {
                analytics.navModalLenkeKopiert(
                  {
                    kilde: source.source,
                    tittel: source.title,
                  },
                  {
                    kildeId: citationId,
                  },
                  tools,
                )
              }
            }}
          />
        </HStack>
        {source.source === "navno" && (
          <BodyLong
            size='small'
            weight='semibold'
          >
            {source.ingress}
          </BodyLong>
        )}
      </VStack>
      <BodyLong size='small'>
        <Markdown
          className='markdown'
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
              />
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
        <Tag
          variant='neutral'
          size='xsmall'
          className='m-1 cursor-pointer select-none transition-colors hover:border-surface-neutral-hover hover:bg-surface-neutral-hover hover:text-text-on-neutral'
        >
          {displayId}
        </Tag>
      </HoverCard>
    </sup>
  )
}

interface CitationLinksProps {
  citations: { citationId: number }[]
  context: Context[]
}

export const CitationLinks = ({ citations, context }: CitationLinksProps) => {
  return (
    <VStack
      gap='2'
      justify='center'
      className='mb-4'
    >
      {citations.map(({ citationId }) => (
        <CitationLink
          key={citationId}
          citations={citations}
          citationId={citationId}
          context={context}
        />
      ))}
    </VStack>
  )
}

interface CitationLinkProps {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
}

const CitationLink = ({ citations, citationId, context }: CitationLinkProps) => {
  const source = context.at(citationId)
  if (!context || !source) {
    return null
  }

  const title =
    source.source === "nks"
      ? source.title
      : source.anchor !== null
        ? `${source.title} / ${source.anchor}`
        : source.title

  const displayId = citations.findIndex((citation) => citation.citationId === citationId) + 1

  return (
    <HStack
      gap='2'
      align='start'
      wrap={false}
    >
      <Tag
        variant='neutral'
        size='xsmall'
      >
        {displayId}
      </Tag>
      <Link
        href={`${source.url}#${source.anchor}`}
        target='_blank'
        title='Åpne artikkelen i ny fane'
        className='text-base'
      >
        <span className='inline-flex items-center gap-2'>
          <BodyShort size='small'>{title}</BodyShort>
          <ExternalLinkIcon className='mt-0.5 self-start' />
        </span>
      </Link>
    </HStack>
  )
}
