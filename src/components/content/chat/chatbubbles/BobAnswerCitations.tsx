import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Detail, Label, Link } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { Citation, Context } from "../../../../types/Message.ts"
import { KunnskapsbasenIcon } from "../../../../assets/icons/KunnskapsbasenIcon.tsx"
import { NavNoIcon } from "../../../../assets/icons/NavNoIcon.tsx"

interface BobAnswerCitationProps {
  citation: Citation
  context: Context[]
}

// Matching citation.text against context metadata, to find correct URL //
function BobAnswerCitations({ citation, context }: BobAnswerCitationProps) {
  const matchingContextCitationData = context.at(citation.sourceId)

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
    return encodeURIComponent(text).replace(
      /[-!'()*#]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    )
  }

  const expandAll =
    matchingContextCitationData?.source === "navno" ? "?expandall=true" : ""

  return (
    <div className='mb-2 flex flex-col'>
      <Label size='small' className='mb-1'>
        {matchingContextCitationData ? (
          <div className='flex flex-wrap gap-2'>
            <Link
              href={
                numWords < 1
                  ? `${matchingContextCitationData.url}`
                  : `${matchingContextCitationData.url}${expandAll}#:~:text=${encodeFragment(textStart)},${encodeFragment(textEnd)}`
              }
              target='_blank'
              title='Åpne artikkelen i ny fane'
            >
              {matchingContextCitationData.title}
              <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
            </Link>
            {matchingContextCitationData.source === "navno" && (
              <Detail
                title='Artikler fra nav.no'
                textColor="subtle"
                className="font-normal"
              >
                <div className="flex gap-1.5">
                  <NavNoIcon />
                  Nav.no
                </div>
              </Detail>
            )}
            {matchingContextCitationData.source === "nks" && (
              <Detail
                title='Artikler fra NKS sin kunnskapsbase i Salesforce'
                textColor="subtle"
                className="font-normal"
              >
                <div className="flex gap-1.5">
                  <KunnskapsbasenIcon />
                  Kunnskapsbasen
                </div>
              </Detail>
            )}
          </div>
        ) : (
          <BodyShort size='medium'>
            Kunne ikke finne lenke til artikkelen.
          </BodyShort>
        )}
      </Label>
      <BodyLong size='small' className='mt-1 italic'>
        <Markdown
          className='markdown'
          components={{
            a: ({ ...props }) => (
              <a {...props} target='_blank' rel='noopener noreferrer' />
            ),
          }}
        >
          {citation.text}
        </Markdown>
      </BodyLong>
    </div>
  )
}

export default BobAnswerCitations
