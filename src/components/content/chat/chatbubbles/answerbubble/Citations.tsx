import { Accordion, BodyLong, BodyShort, CopyButton, HStack, Label, Link, VStack } from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { KunnskapsbasenIcon } from "../../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../../assets/icons/NavNoIcon.tsx"
import { Context } from "../../../../../types/Message.ts"
import analytics from "../../../../../utils/analytics.ts"
import { buildLinkTitle } from "../../../../../utils/link.ts"
import { HoverCard } from "../../../../ui/HoverCard.tsx"
import { MultiCitation, SingleCitation, SourceIcon } from "../BobAnswerCitations.tsx"
import "./Citations.css"

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
            h2: ({ ...props }) => (
              <h2
                {...props}
                className='mb-2 font-semibold'
              />
            ),
            h3: ({ ...props }) => (
              <h3
                {...props}
                className='mb-1 font-semibold'
              />
            ),
            h4: ({ ...props }) => (
              <h4
                {...props}
                className='mb-1 font-semibold'
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
      <Accordion
        size='small'
        data-color='neutral'
      >
        {Array.from(groups.values()).map((group) => (
          <GroupedCitationLink
            key={group.key}
            citations={citations}
            source={group.source}
            citationIds={group.citationIds}
            context={context}
          />
        ))}
      </Accordion>
    </VStack>
  )
}

type GroupedCitationLinkProps = {
  citations: { citationId: number }[]
  source: Context
  citationIds: number[]
  context: Context[]
}

const GroupedCitationLink = ({ citations, source, citationIds, context }: GroupedCitationLinkProps) => {
  const title = buildLinkTitle(source)

  const displayIds = citationIds
    .map((id) => citations.findIndex((citation) => citation.citationId === id) + 1)
    .filter((n) => n > 0)

  const citationObjects = citationIds
    .map((id) => {
      const ctx = context.at(id)
      return ctx ? { sourceId: id, text: ctx.content } : null
    })
    .filter((c): c is { sourceId: number; text: string } => c !== null)

  return (
    <>
      <Accordion.Item>
        <Accordion.Header className='citation-accordion-header w-full text-base'>
          <HStack
            gap='space-2'
            align='center'
            wrap={false}
            className='w-full min-w-0'
          >
            {source.source === "nks" ? <KunnskapsbasenIcon size={18} /> : <NavNoIcon size={18} />}

            <BodyShort
              size='small'
              className='min-w-0 flex-1 truncate'
            >
              {title}
            </BodyShort>
            {displayIds.map((displayId) => (
              <div
                key={displayId}
                className='bg-ax-bg-neutral-moderate h-fit rounded-sm px-1'
              >
                <BodyShort size='small'>{displayId}</BodyShort>
              </div>
            ))}
            {source.source === "nks" ? (
              <CopyButton
                copyText={title}
                size='xsmall'
                className='ml-auto'
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <CopyButton
                copyText={`${source.url}#${source.anchor ?? ""}`}
                size='xsmall'
                className='ml-auto'
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </HStack>
        </Accordion.Header>
        <Accordion.Content>
          <Link
            href={source.url}
            target='_blank'
          >
            <Label
              size='small'
              className='cursor-pointer'
              title='Gå til artikkelen'
            >
              {source.title}
            </Label>
          </Link>
          {citationObjects.length === 1 ? (
            <SingleCitation
              citation={citationObjects[0]}
              context={context.at(citationObjects[0].sourceId)}
            />
          ) : (
            <MultiCitation
              title={title}
              source={source.source}
              citations={citationObjects}
              contexts={context}
            />
          )}
        </Accordion.Content>
      </Accordion.Item>

      {/*
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
    */}
    </>
  )
}
