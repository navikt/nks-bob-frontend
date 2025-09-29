import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, CopyButton, Detail, HStack, Label, Link, Tooltip } from "@navikt/ds-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { KunnskapsbasenIcon } from "../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../assets/icons/NavNoIcon.tsx"
import { Citation, Context } from "../../../../types/Message.ts"

interface BobAnswerCitationProps {
  citation: { title: string; source: "navno" | "nks"; citations: Citation[] }
  context: Context[]
}

// Matching citation.text against context metadata, to find correct URL //
function BobAnswerCitations({ citation, context }: BobAnswerCitationProps) {
  if (citation.citations.length === 1) {
    const singleCitation = citation.citations.at(0)!
    return (
      <SingleCitation
        citation={singleCitation}
        context={context.at(singleCitation.sourceId)}
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

const SingleCitation = ({ citation, context }: { citation: Citation; context: Context | undefined }) => {
  return (
    <div className='mb-2 flex flex-col'>
      <Label
        size='small'
        className='mb-1'
      >
        {context ? (
          <div className='flex flex-wrap gap-2'>
            <CitationLink
              citation={citation}
              matchingContextCitationData={context}
            />
            <SourceIcon source={context.source} />
          </div>
        ) : (
          <BodyShort size='medium'>Kunne ikke finne lenke til artikkelen.</BodyShort>
        )}
      </Label>
      <BodyLong
        size='small'
        className='mt-1 italic'
      >
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
          {citation.text}
        </Markdown>
      </BodyLong>
    </div>
  )
}

const MultiCitation = ({
  title,
  source,
  citations,
  contexts,
}: {
  title: string
  source: "navno" | "nks"
  citations: Citation[]
  contexts: Context[]
}) => {
  const articleLink = contexts.at(citations[0]!.sourceId)!.url
  return (
    <div className='mb-2 flex flex-col'>
      <Label
        size='small'
        className='mb-1'
      >
        <HStack align='center'>
          <Tooltip content='Kopier tittelen'>
            <CopyButton
              copyText={title}
              size='xsmall'
            />
          </Tooltip>
          <HStack
            align='center'
            gap='4'
          >
            <Tooltip content='Åpner artikkelen i ny fane'>
              <Link
                href={articleLink}
                target='_blank'
              >
                {title}
                <ExternalLinkIcon fontSize={14} />
              </Link>
            </Tooltip>
            <SourceIcon source={source} />
          </HStack>
        </HStack>
      </Label>
      <div className='flex flex-col gap-2'>
        {citations.map((citation) => (
          <>
            <div className='group mt-1 gap-1 italic'>
              <Markdown
                className='markdown markdown-inline navds-body-short--small mb-1 inline'
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
                {citation.text}
              </Markdown>{" "}
              <CitationLink
                citation={citation}
                matchingContextCitationData={contexts.at(citation.sourceId)!}
                title=''
                className='inline'
              />
            </div>
          </>
        ))}
      </div>
    </div>
  )
}

const CitationLink = ({
  citation,
  matchingContextCitationData,
  title,
  className,
}: {
  citation: Citation
  matchingContextCitationData: Context
  title?: string
  className?: string
}) => {
  // Splitting words, making it functional for textStart & textEnd //
  const citeWords = citation.text
    .replace(/\n\n|\n/g, " ")
    .split(" ")
    .filter((link) => !/https?/.test(link))

  // Min- and max count of words for the 6 (max) first- and last words in the citation //
  const numWords = Math.min(citeWords.length / 2, 6)
  const textStart = citeWords.slice(0, numWords).join(" ")
  const textEnd = citeWords.slice(-numWords).join(" ")

  // Encoding for RFC3986 - making text fragments to work for citations with unreserved marks //
  function encodeFragment(text: string) {
    return encodeURIComponent(text).replace(/[-!'()*#]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
  }

  // Expands all panels on the nav.no-page //
  const expandAll = matchingContextCitationData?.source === "navno" ? "?expandall=true" : ""

  const useAnchor = matchingContextCitationData?.url.includes("/saksbehandlingstider")

  return (
    <HStack align='center'>
      <Tooltip content='Kopier tittelen'>
        <CopyButton
          copyText={title ?? matchingContextCitationData.title}
          size='xsmall'
        />
      </Tooltip>
      <Tooltip content='Åpner artikkelen i ny fane'>
        <Link
          href={
            useAnchor
              ? `${matchingContextCitationData.url}${expandAll}#${matchingContextCitationData.anchor}`
              : numWords < 1
                ? `${matchingContextCitationData.url}`
                : `${matchingContextCitationData.url}${expandAll}#:~:text=${encodeFragment(textStart)},${encodeFragment(textEnd)}`
          }
          target='_blank'
          inlineText
          className={`${className} navds-body-short--small`}
        >
          {title ?? matchingContextCitationData.title}
          <ExternalLinkIcon fontSize={14} />
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
