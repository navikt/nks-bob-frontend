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
import { buildLinkTitle } from "../../../../../utils/link.ts"

interface CitationNumberProps {
  citations: { citationId: number }[]
  citationId: number
  context: Context[]
  tools: string[]
}

export const CitationNumber = ({ citations, citationId, context, tools }: CitationNumberProps) => {
  const [isActive, setIsActive] = useState(false)
  const source = context.at(citationId)
  if (!context || !source) {
    return null
  }

  const title = buildLinkTitle(source)
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
    <sup className='align-sub'>
      <HoverCard
        content={hoverContent}
        onOpenChange={setIsActive}
        context={source}
        sourceId={citationId}
        tools={tools}
      >
        <button
          type='button'
          aria-pressed={isActive}
          className='ml-[4px] rounded-[4px] bg-[rgba(0,14,41,0.07)] px-[4px] aria-pressed:bg-[rgba(73,81,94,1)] aria-pressed:text-[rgba(255,255,255,1)] dark:bg-[rgba(28_35_47/1)] dark:aria-pressed:text-[rgba(0_0_0/1)] dark:aria-pressed:hover:bg-[rgba(148,155,168,1)]'
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
  tools: string[]
}

export const CitationLinks = ({ citations, context, tools }: CitationLinksProps) => {
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
      gap='2'
      justify='center'
      className='mb-4'
    >
      {Array.from(groups.values()).map((group) => (
        <GroupedCitationLink
          key={group.key}
          citations={citations}
          source={group.source}
          citationIds={group.citationIds}
          tools={tools}
        />
      ))}
    </VStack>
  )
}

type GroupedCitationLinkProps = {
  citations: { citationId: number }[]
  source: Context
  citationIds: number[]
  tools: string[]
}

const GroupedCitationLink = ({ citations, source, citationIds, tools }: GroupedCitationLinkProps) => {
  const title = buildLinkTitle(source)

  const displayIds = citationIds
    .map((id) => citations.findIndex((citation) => citation.citationId === id) + 1)
    .filter((n) => n > 0)

  return (
    <HStack
      gap='2'
      align='center'
      wrap={false}
    >
      <HStack
        gap='1'
        wrap={false}
      >
        {displayIds.map((displayId) => (
          <div
            key={displayId}
            className='ml-[2px] rounded-[4px] bg-[rgba(0,14,41,0.07)] px-[4px] aria-pressed:text-[rgba(223_225_229/1)] dark:bg-[rgba(28_35_47/1)] dark:aria-pressed:text-[rgba(0_0_0/1)] dark:aria-pressed:hover:bg-[rgba(148,155,168,1)]'
          >
            <BodyShort size='small'> {displayId}</BodyShort>
          </div>
        ))}
      </HStack>

      {source.source === "nks" ? <KunnskapsbasenIcon size={18} /> : <NavNoIcon size={18} />}

      <span className='inline-flex items-center gap-2'>
        <Link
          href={`${source.url}#${source.anchor ?? ""}`}
          target='_blank'
          title='Åpne artikkelen i ny fane'
          className='text-base'
          onClick={() => {
            analytics.fotnoteLenkeKlikket(
              { kilde: source.source, tittel: source.title, artikkelKolonne: source.articleColumn },
              citationIds.map((id) => ({ kildeId: id })),
              tools,
            )
          }}
        >
          <BodyShort size='small'>{title}</BodyShort>
        </Link>

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
