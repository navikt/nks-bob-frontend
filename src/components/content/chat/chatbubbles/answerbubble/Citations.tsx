import { BodyLong, BodyShort, CopyButton, HStack, Tooltip, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { KunnskapsbasenIcon } from "../../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../../assets/icons/NavNoIcon.tsx"
import { Context } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { buildLinkTitle } from "../../../../../utils/link.ts"
import { HoverCard } from "../../../../ui/HoverCard.tsx"
import { SourceIcon, TextFragmentLink } from "../BobAnswerCitations.tsx"

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

  const title = buildLinkTitle(source)
  const displayId = citations.findIndex((citation) => citation.citationId === citationId) + 1

  const hoverContent = (
    <div className='flex flex-col gap-4'>
      <VStack gap='space-8'>
        <div className='border-ax-border-neutral-subtle mb-2 border-b pb-3'>
          <SourceIcon source={source.source} />
        </div>
        <HStack
          align='center'
          gap='space-4'
        >
          {/*
          <Link
            href={`${source.url}#${source.anchor}`}
            target='_blank'
            title='Åpne artikkelen i ny fane'
            onClick={() => {
              if (source.source === "nks") {
                analytics.kbModalLenkeKlikket({
                  kilde: source.source,
                  tittel: source.title,
                  artikkelKolonne: source.articleColumn,
                })
              } else if (source.source === "navno") {
                analytics.navModalLenkeKlikket({
                  kilde: source.source,
                  tittel: source.title,
                })
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
          */}
          <TextFragmentLink
            title={title}
            matchingContextCitationData={source}
            text={source.content}
            onClick={() => {
              if (source.source === "nks") {
                analytics.kbModalLenkeKlikket({
                  kilde: source.source,
                  tittel: source.title,
                  artikkelKolonne: source.articleColumn,
                })
              } else if (source.source === "navno") {
                analytics.navModalLenkeKlikket({
                  kilde: source.source,
                  tittel: source.title,
                })
              }
            }}
          />
          <CopyButton
            copyText={source.source === "nks" ? source.title : `${source.url}#${source.anchor}`}
            size='xsmall'
            onClick={() => {
              if (source.source === "nks") {
                analytics.kbModalLenkeKopiert({
                  kilde: source.source,
                  tittel: source.title,
                  artikkelKolonne: source.articleColumn,
                })
              } else if (source.source === "navno") {
                analytics.navModalLenkeKopiert({
                  kilde: source.source,
                  tittel: source.title,
                })
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
        context={source}
      >
        <button
          type='button'
          aria-pressed={isActive}
          className='bg-ax-bg-neutral-moderate aria-pressed:bg-ax-bg-neutral-strong-pressed aria-pressed:text-ax-bg-default ml-1 cursor-pointer rounded-sm px-1'
        >
          <BodyShort size='small'>{displayId}</BodyShort>
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
  type Group = {
    key: string
    source: Context
    citationIds: number[]
  }

  const groups = new Map<string, Group>()

  for (const { citationId } of citations) {
    const source = context?.at(citationId)
    if (!source) continue

    const groupKey = `${source.url}#${source.anchor ?? ""}`

    const existing = groups.get(groupKey)
    if (existing) {
      existing.citationIds.push(citationId)
    } else {
      groups.set(groupKey, { key: groupKey, source, citationIds: [citationId] })
    }
  }

  return (
    <VStack
      gap='space-8'
      justify='center'
      className='mb-4'
    >
      {Array.from(groups.values()).map((group) => (
        <GroupedCitationLink
          key={group.key}
          citations={citations}
          source={group.source}
          citationIds={group.citationIds}
        />
      ))}
    </VStack>
  )
}

type GroupedCitationLinkProps = {
  citations: { citationId: number }[]
  source: Context
  citationIds: number[]
}

const GroupedCitationLink = ({ citations, source, citationIds }: GroupedCitationLinkProps) => {
  const title = buildLinkTitle(source)

  const displayIds = citationIds
    .map((id) => citations.findIndex((citation) => citation.citationId === id) + 1)
    .filter((n) => n > 0)

  return (
    <HStack
      gap='space-8'
      align='center'
      wrap={false}
    >
      <HStack
        gap='space-4'
        wrap={false}
      >
        {displayIds.map((displayId) => (
          <div
            key={displayId}
            className='bg-ax-bg-neutral-moderate aria-pressed:bg-ax-bg-neutral-strong-pressed aria-pressed:text-ax-bg-default ml-1 rounded-sm px-1'
          >
            <BodyShort size='small'>{displayId}</BodyShort>
          </div>
        ))}
      </HStack>

      {source.source === "nks" ? <KunnskapsbasenIcon size={18} /> : <NavNoIcon size={18} />}

      <span className='inline-flex items-center gap-2'>
        {/*
        <Link
          href={`${source.url}#${source.anchor ?? ""}`}
          target='_blank'
          title='Åpne artikkelen i ny fane'
          className='text-base'
          onClick={() => {
            analytics.fotnoteLenkeKlikket({
              kilde: source.source,
              tittel: source.title,
              artikkelKolonne: source.articleColumn,
            })
          }}
        >
          <BodyShort size='small'>{title}</BodyShort>
        </Link>

        */}

        <TextFragmentLink
          text={source.content}
          matchingContextCitationData={source}
          onClick={() => {
            analytics.fotnoteLenkeKlikket({
              kilde: source.source,
              tittel: source.title,
              artikkelKolonne: source.articleColumn,
            })
          }}
          title={title}
        />

        {/* TODO: track event for copy */}
        {source.source === "nks" ? (
          <Tooltip content='Kopier artikkelnavn'>
            <CopyButton
              copyText={title}
              size='xsmall'
            />
          </Tooltip>
        ) : (
          <Tooltip content='Kopier lenken'>
            <CopyButton
              copyText={`${source.url}#${source.anchor ?? ""}`}
              size='xsmall'
            />
          </Tooltip>
        )}
      </span>
    </HStack>
  )
}
