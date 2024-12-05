import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Heading, Link } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { Citation, Context } from "../../../../types/Message.ts"
import { createTextFragment } from "../../../../utils/text-fragment.ts"

interface BobAnswerCitationProps {
  citation: Citation
  context: Context[]
}

// Matching citation.text against context metadata, to find correct URL //
function BobAnswerCitations({ citation, context }: BobAnswerCitationProps) {
  const matchingContextCitationData = context.at(citation.sourceId)
  const textFragment = createTextFragment(citation)

  return (
    <div className='fade-in-citations flex flex-col'>
      <Heading size='xsmall' spacing={true}>
        {matchingContextCitationData ? (
          <Link
            href={
              textFragment === null
                ? `${matchingContextCitationData.url}`
                : `${matchingContextCitationData.url}#:~:text=${textFragment}`
            }
            target='_blank'
          >
            {matchingContextCitationData.title}
            <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
          </Link>
        ) : (
          <BodyShort size='medium'>
            Kunne ikke finne lenke til artikkelen.
          </BodyShort>
        )}
      </Heading>
      <BodyLong size='small' spacing>
        <Markdown
          components={{
            a: ({ ...props }) => (
              <a {...props} target='_blank' rel='noopener noreferrer' />
            ),
          }}
          className='markdown italic'
        >
          {citation.text}
        </Markdown>
      </BodyLong>
    </div>
  )
}

export default BobAnswerCitations
