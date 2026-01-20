import { ChevronRightDoubleIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, CopyButton, Detail, HStack, Label, Link, Tooltip } from "@navikt/ds-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { KunnskapsbasenIcon } from "../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../assets/icons/NavNoIcon.tsx"
import { Citation, Context } from "../../../../types/Message.ts"
import analytics from "../../../../utils/analytics.ts"
import { md } from "../../../../utils/markdown.ts"

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
  function handleClick() {
    if (context?.source === "nks") {
      analytics.kbSitatLenkeKlikket()
    } else if (context?.source === "navno") {
      analytics.navSitatLenkeKlikket()
    }
  }

  return (
    <div className='mb-2 flex flex-col'>
      {context ? (
        <TitleLink context={context} />
      ) : (
        <BodyShort size='medium'>Kunne ikke finne lenke til artikkelen.</BodyShort>
      )}

      <BodyLong
        size='small'
        className='mt-1 italic'
      >
        <Markdown
          className='markdown answer-markdown mb-2'
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
      {context && (
        <CitationLink
          citation={citation}
          matchingContextCitationData={context}
          onClick={handleClick}
          title=''
        />
      )}
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

  function handleMainLinkClick() {
    if (source === "nks") {
      analytics.kbSitatLenkeKlikket()
    } else if (source === "navno") {
      analytics.navSitatLenkeKlikket()
    }
  }

  function handleCitationLinkClick(citation: Citation) {
    const context = contexts.at(citation.sourceId)
    if (context?.source === "nks") {
      analytics.kbSitatLenkeKlikket()
    } else if (context?.source === "navno") {
      analytics.navSitatLenkeKlikket()
    }
  }

  return (
    <div className='mb-8 flex flex-col'>
      <Label
        size='small'
        className='mb-1'
      >
        <HStack align='center'>
          <HStack
            align='center'
            gap='3'
          >
            <HStack
              align='center'
              gap='1'
            >
              <Tooltip content='Åpne artikkelen i ny fane'>
                <Link
                  href={articleLink}
                  target='_blank'
                  onClick={handleMainLinkClick}
                >
                  {title}
                </Link>
              </Tooltip>
              <CopyButton
                copyText={source === "nks" ? title : articleLink}
                size='xsmall'
                onClick={() => {
                  if (source === "nks") {
                    analytics.kbSitatTittelKopiert()
                  } else if (source === "navno") {
                    analytics.navSitatLenkeKopiert()
                  }
                }}
              />
            </HStack>
            <SourceIcon source={source} />
          </HStack>
        </HStack>
      </Label>
      <div className='flex flex-col gap-2'>
        {citations.map((citation) => (
          <>
            <div className='group mt-1 gap-1 italic'>
              <Markdown
                className='markdown answer-markdown markdown-inline navds-body-short--small mb-1 inline'
                remarkPlugins={[remarkGfm, md.rewriteRelativeLinks]}
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
                onClick={() => handleCitationLinkClick(citation)}
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
  onClick,
}: {
  citation: Citation
  matchingContextCitationData: Context
  title?: string
  className?: string
  onClick?: () => void
}) => {
  function processTextForBlocks(text: string) {
    const blockSeparators = [/\n\s*\n/g, /\n\s*[-•·‣⁃*]\s*/g, /\n\s*\d+\.\s*/g, /\n\s*#{1,6}\s*/g, /\n\s*>\s*/g]

    let blocks = [text]

    blockSeparators.forEach((separator) => {
      blocks = blocks.flatMap((block) => block.split(separator).filter((part) => part.trim().length > 0))
    })

    const cleanedBlocks = blocks
      .map((block) =>
        block
          .replace(/^[-•·‣⁃*]\s*/g, "")
          .replace(/\n\s*[-•·‣⁃*]\s*/g, " ")
          .replace(/[•·‣⁃*]/g, "")
          .replace(/\n/g, " ")
          .replace(/\s+/g, " ")
          .replace(/#{1,6}\s*/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
          .trim(),
      )
      .filter((block) => block.length > 0)

    return cleanedBlocks
  }

  const textBlocks = processTextForBlocks(citation.text)

  if (textBlocks.length <= 1) {
    const citeWords = citation.text
      .replace(/\n\n|\n/g, " ")
      .replace(/^[-•·‣⁃*]\s*/g, "")
      .replace(/\n\s*[-•·‣⁃*]\s*/g, " ")
      .replace(/[•·‣⁃*]/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => !/https?/.test(word) && word.length > 0)

    const totalWords = citeWords.length

    if (totalWords <= 6) {
      const textStart = citeWords.join(" ")
      return buildLinkWithTextFragments(textStart, "")
    }

    let numWords
    if (totalWords <= 10) {
      numWords = Math.max(Math.min(totalWords - 2, 8), 3)
    } else if (totalWords <= 20) {
      numWords = Math.min(totalWords / 3, 8)
    } else {
      numWords = Math.min(totalWords / 2, 6)
    }

    const textStart = citeWords.slice(0, numWords).join(" ")
    const textEnd = citeWords.slice(-numWords).join(" ")

    return buildLinkWithTextFragments(textStart, textEnd)
  }

  const firstBlock = textBlocks[0]
  const lastBlock = textBlocks[textBlocks.length - 1]

  const firstBlockWords = firstBlock.split(" ").filter((word) => word.length > 0)
  const lastBlockWords = lastBlock.split(" ").filter((word) => word.length > 0)

  const firstBlockTotalWords = firstBlockWords.length
  const lastBlockTotalWords = lastBlockWords.length

  const maxWordsFromFirstBlock =
    firstBlockTotalWords <= 6 ? Math.max(firstBlockTotalWords, 3) : Math.min(firstBlockTotalWords, 6)
  const textStart = firstBlockWords.slice(0, maxWordsFromFirstBlock).join(" ")

  const maxWordsFromLastBlock =
    lastBlockTotalWords <= 6 ? Math.max(lastBlockTotalWords, 3) : Math.min(lastBlockTotalWords, 6)
  const textEnd = lastBlockWords.slice(-maxWordsFromLastBlock).join(" ")

  function buildLinkWithTextFragments(start: string, end: string) {
    function encodeFragment(text: string) {
      return encodeURIComponent(text).replace(/[-!'()*#]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    }

    const expandAll = matchingContextCitationData?.source === "navno" ? "?expandall=true" : ""
    const useAnchor = matchingContextCitationData?.url.includes("/saksbehandlingstider")

    const textFragment = end && end.trim() ? `${encodeFragment(start)},${encodeFragment(end)}` : encodeFragment(start)

    return (
      <HStack align='center'>
        <Tooltip content='Åpner artikkelen i ny fane'>
          <Link
            href={
              title === "" && matchingContextCitationData.source === "navno"
                ? `${matchingContextCitationData.url}#${matchingContextCitationData.anchor}`
                : useAnchor
                  ? `${matchingContextCitationData.url}${expandAll}#${matchingContextCitationData.anchor}`
                  : !start || start.trim().length === 0
                    ? `${matchingContextCitationData.url}`
                    : matchingContextCitationData.articleColumn
                      ? `${matchingContextCitationData.url}${expandAll}#${matchingContextCitationData.articleColumn}:~:text=${textFragment}`
                      : `${matchingContextCitationData.url}${expandAll}#:~:text=${textFragment}`
            }
            target='_blank'
            inlineText
            className={`${className} navds-body-short--small`}
            onClick={onClick}
          >
            {title ?? matchingContextCitationData.title}
            {title === "" ? (
              <div className='mt-2 flex items-center gap-1'>
                Finn sitatet i artikkelen
                <ChevronRightDoubleIcon />
              </div>
            ) : null}
          </Link>
        </Tooltip>
      </HStack>
    )
  }

  return buildLinkWithTextFragments(textStart, textEnd)
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

  return (
    <HStack
      align='center'
      gap='3'
    >
      <HStack
        align='center'
        gap='1'
      >
        <SourceIcon source={context.source} />
        <Tooltip content='Åpne artikkelen i ny fane'>
          <Label size='small'>
            <Link
              href={context.url}
              target='_blank'
              className='navds-label_small'
            >
              {`${context.title} (${context.ingress})`}
            </Link>
          </Label>
        </Tooltip>

        <CopyButton
          copyText={context.source === "nks" ? context.title : context.url}
          size='xsmall'
          onClick={() => {
            if (context.source === "nks") analytics.kbSitatTittelKopiert()
            if (context.source === "navno") analytics.navSitatLenkeKopiert()
          }}
        />
      </HStack>
    </HStack>
  )
}
