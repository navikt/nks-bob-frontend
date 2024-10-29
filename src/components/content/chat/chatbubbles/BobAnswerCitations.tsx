import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Heading, Link } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { Context } from "../../../../types/Message.ts"

interface BobAnswerCitationProps {
  citation: {
    title: string
    text: string
    section: string
    article: string
  }
  context: Context[]
}

function BobAnswerCitations({ citation, context }: BobAnswerCitationProps) {
  const matchingContextCitationData = context
    .flatMap((context) => context.metadata)
    .find(
      (contextMetadata) =>
        contextMetadata.Title === citation.title &&
        contextMetadata.Section === citation.section &&
        contextMetadata.KnowledgeArticleId === citation.article,
    )

  const words = citation.text.replace("\n", "").split(" ")
  const textStart = words.slice(0, 3).join(" ")
  const textEnd = words.slice(-3).join(" ")
  const textFragment = `${encodeURIComponent(textStart)},${encodeURIComponent(textEnd)}`

  return (
    <div className='fade-in-citations flex flex-col'>
      <Heading size='xsmall' spacing={true}>
        {matchingContextCitationData ? (
          <Link
            href={`${matchingContextCitationData.KnowledgeArticle_QuartoUrl}#:~:text=${textFragment}`}
            target='_blank'
          >
            {citation.title}
            <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
          </Link>
        ) : (
          <BodyShort size='medium'>
            Kunne ikke finne lenke til artikkelen.
          </BodyShort>
        )}
      </Heading>
      <BodyLong size='small' spacing>
        <Markdown className='markdown italic'>{citation.text}</Markdown>
      </BodyLong>
    </div>
  )
}

export default BobAnswerCitations
