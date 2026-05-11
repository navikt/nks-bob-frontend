import { ChevronRightDoubleIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, CopyButton, Detail, HStack, Label, Link, Tooltip } from "@navikt/ds-react"
import { KunnskapsbasenIcon } from "../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../assets/icons/NavNoIcon.tsx"
import { Citation, Context, Contexts } from "../../../../types/Message.ts"
import analytics from "../../../../utils/analytics.ts"
import { AppMarkdown } from "../../../../utils/AppMarkdown.tsx"
import { buildLinkTitle } from "../../../../utils/link.ts"
import { md } from "../../../../utils/markdown.ts"
import { buildTextFragmentLink } from "../../../../utils/buildTextFragmentLink.tsx"

interface BobAnswerCitationProps {
  citation: { title: string; source: "navno" | "nks"; citations: Citation[] }
  context: Contexts
}

// Matching citation.text against context metadata, to find correct URL //
function BobAnswerCitations({ citation, context }: BobAnswerCitationProps) {
  if (citation.citations.length === 1) {
    const singleCitation = citation.citations.at(0)!
    return (
      <SingleCitation
        citation={singleCitation}
        context={context[singleCitation.sourceId]}
      />
    )
  }

  if (citation.citations.length > 1) {
    return (
      <MultiCitation
        title={citation.title}
        source={citation.source}
        citations={citation.citations}
        contexts={context}
      />
    )
  }

  return <></>
}

export default BobAnswerCitations

export const SingleCitation = ({ citation, context }: { citation: Citation; context: Context | undefined }) => {
  function handleClick() {
    if (context?.source === "nks") {
      analytics.kbSitatLenkeKlikket({
        tittel: context.title,
        kilde: context.source,
        artikkelKolonne: context.articleColumn,
      })
    } else if (context?.source === "navno") {
      analytics.navSitatLenkeKlikket({ tittel: context.title, kilde: context.source })
    }
  }

  return (
    <div className='flex flex-col pb-6'>
      <BodyLong
        size='small'
        className='mb-3'
      >
        <AppMarkdown remarkPlugins={[md.rewriteRelativeLinks]}>{citation.text}</AppMarkdown>
      </BodyLong>
      {context && (
        <TextFragmentLink
          text={citation.text}
          matchingContextCitationData={context}
          onClick={handleClick}
          title=''
        />
      )}
    </div>
  )
}

export const MultiCitation = ({
  title,
  citations,
  contexts,
}: {
  title: string
  source: "navno" | "nks"
  citations: Citation[]
  contexts: Contexts
}) => {
  //const mainCitation = citations[0]
  // const mainContext = mainCitation ? contexts[mainCitation.sourceId] : undefined

  function handleCitationLinkClick(citation: Citation) {
    const context = contexts[citation.sourceId]
    if (context?.source === "nks") {
      analytics.kbSitatLenkeKlikket({
        tittel: context.title,
        kilde: context.source,
        artikkelKolonne: context.articleColumn,
      })
    } else if (context?.source === "navno") {
      analytics.navSitatLenkeKlikket({ tittel: context.title, kilde: context.source })
    }
  }

  return (
    <div className='flex flex-col pb-6'>
      {/* {mainCitation && <TitleLink context={mainContext} />} */}
      <div className='mb-2 flex flex-col gap-4'>
        {citations.map((citation) => (
          <div
            key={`multi-citation-${title}-${citation.sourceId}`}
            className='group mt-1 mb-2 gap-1'
          >
            <BodyLong
              size='small'
              className='italic'
            >
              <AppMarkdown>{citation.text}</AppMarkdown>
            </BodyLong>
            <TextFragmentLink
              text={citation.text}
              matchingContextCitationData={contexts[citation.sourceId]!}
              title=''
              className='inline'
              onClick={() => handleCitationLinkClick(citation)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const TextFragmentLink = ({
  text,
  matchingContextCitationData,
  title,
  anchor,
  className,
  onClick,
}: {
  text: string
  matchingContextCitationData: Context
  title?: string
  anchor?: string
  className?: string
  onClick?: () => void
}) => {
  const link = buildTextFragmentLink(text, matchingContextCitationData, anchor)
  return (
    <HStack align='center'>
      <Tooltip content='Åpner artikkelen i ny fane'>
        <Link
          href={link}
          target='_blank'
          inlineText
          className={`${className} aksel-body-short--small`}
          onClick={onClick}
        >
          {title ?? matchingContextCitationData.title}
          {title === "" ? (
            <BodyShort
              size='small'
              className='mt-2 flex items-center gap-1'
              weight='semibold'
            >
              Finn sitatet i artikkelen
              <ChevronRightDoubleIcon />
            </BodyShort>
          ) : null}
        </Link>
      </Tooltip>
    </HStack>
  )
}

export const SourceIcon = ({ source }: { source: "navno" | "nks" }) => {
  return (
    <>
      {source === "navno" && (
        <Detail
          title='Artikler fra nav.no'
          textColor='subtle'
          className='font-normal'
        >
          <div className='flex gap-1.5'>
            <NavNoIcon />
            Nav.no
          </div>
        </Detail>
      )}
      {source === "nks" && (
        <Detail
          title='Artikler fra NKS sin kunnskapsbase i Salesforce'
          textColor='subtle'
          className='font-normal'
        >
          <div className='flex gap-1.5'>
            <KunnskapsbasenIcon />
            Kunnskapsbasen
          </div>
        </Detail>
      )}
    </>
  )
}

export const TitleLink = ({ context }: { context?: Context }) => {
  if (!context) return null

  const urlReturn = () => {
    const navUrlWAnchor = `${context.url}#${context.anchor}`
    const navUrl = `${context.url}`
    const nksUrl = `${context.url}`

    if (context.source === "navno" && context.anchor != null) {
      return navUrlWAnchor
    } else if (context.source === "navno" && context.anchor === null) {
      return navUrl
    } else if (context.source === "nks") {
      return nksUrl
    }
  }

  return (
    <HStack
      align='center'
      gap='space-12'
      className='mb-1'
    >
      <HStack
        align='center'
        gap='space-4'
      >
        <Tooltip content='Åpne artikkelen i ny fane'>
          <Label size='small'>
            <Link
              href={urlReturn()}
              target='_blank'
              className='aksel-label_small'
            >
              {buildLinkTitle(context)}
            </Link>
          </Label>
        </Tooltip>

        <CopyButton
          copyText={context.source === "nks" ? context.title : context.url}
          size='xsmall'
          onClick={() => {
            if (context.source === "nks") {
              analytics.kbSitatTittelKopiert({
                tittel: context.title,
                kilde: context.source,
                artikkelKolonne: context.articleColumn,
              })
            } else if (context.source === "navno") {
              analytics.navSitatLenkeKopiert({ tittel: context.title, kilde: context.source })
            }
          }}
        />
      </HStack>
      <SourceIcon source={context.source} />
    </HStack>
  )
}
