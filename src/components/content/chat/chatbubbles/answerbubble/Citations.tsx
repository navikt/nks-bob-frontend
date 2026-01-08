import { BodyLong, BodyShort, CopyButton, HStack, Label, Link, Tooltip, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { KunnskapsbasenIcon } from "../../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../../assets/icons/NavNoIcon.tsx"
import { Context } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { HoverCard } from "../../../../ui/HoverCard.tsx"
import { SourceIcon } from "../BobAnswerCitations.tsx"

interface CitationNumberProps {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
}

export const CitationNumber = ({ citations, citationId, context }: CitationNumberProps) => {
  const [isActive, setIsActive] = useState(false)
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
                analytics.kbModalLenkeKlikket()
              } else if (source.source === "navno") {
                analytics.navModalLenkeKlikket()
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
                analytics.kbModalLenkeKopiert()
              } else if (source.source === "navno") {
                analytics.navModalLenkeKopiert()
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
    <sup className='align-sub'>
      <HoverCard
        content={hoverContent}
        onOpenChange={setIsActive}
      >
        <button
          type='button'
          aria-pressed={isActive}
          className='ml-[4px] rounded-[4px] bg-[rgba(0,14,41,0.07)] px-[4px] aria-pressed:bg-[rgba(73,81,94,1)] aria-pressed:text-[rgba(255,255,255,1)] dark:bg-[rgba(28_35_47/1)] dark:aria-pressed:text-[rgba(0_0_0/1)] aria-pressed:dark:hover:bg-[rgba(148,155,168,1)]'
        >
          <BodyShort size='small'> {displayId}</BodyShort>
        </button>
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
      align='center'
      wrap={false}
    >
      <div className='ml-[2px] rounded-[4px] bg-[rgba(0,14,41,0.07)] px-[4px] aria-pressed:text-[rgba(223_225_229/1)] dark:bg-[rgba(28_35_47/1)] dark:aria-pressed:text-[rgba(0_0_0/1)] aria-pressed:dark:hover:bg-[rgba(148,155,168,1)]'>
        <BodyShort size='small'> {displayId}</BodyShort>
      </div>
      {source.source === "nks" ? <KunnskapsbasenIcon size={18} /> : <NavNoIcon size={18} />}
      <span className='inline-flex items-center gap-2'>
        <Link
          href={`${source.url}#${source.anchor}`}
          target='_blank'
          title='Åpne artikkelen i ny fane'
          className='text-base'
        >
          <BodyShort size='small'>{title}</BodyShort>
        </Link>
        {source.source === "nks" ? (
          <Tooltip content='Kopier artikkelnavn'>
            <CopyButton
              copyText={title}
              size='xsmall'
            />
          </Tooltip>
        ) : (
          <Tooltip content='Kopier nav-lenken'>
            <CopyButton
              copyText={source.url}
              size='xsmall'
            />
          </Tooltip>
        )}
      </span>
    </HStack>
  )
}
