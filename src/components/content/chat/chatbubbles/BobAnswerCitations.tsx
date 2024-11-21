import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Heading, Link } from "@navikt/ds-react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
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

  const citeWords = citation.text
    // .split(/\n\n|\n/)[0]
    .replace(/\n\n|\n/g, " ")
    .split(" ")
    .filter((link) => !/https?/.test(link))

  const numWords = Math.min(citeWords.length / 2, 6)
  const textStart = citeWords.slice(0, numWords).join(" ")
  const textEnd = citeWords.slice(-numWords).join(" ")

  // const bobCitation = citation.text
  //   .replace(/\n\n/g, "<br><br>")
  //   .replace(/\n/g, "<br>")

  return (
    <div className='fade-in-citations flex flex-col'>
      <Heading size='xsmall' spacing={true}>
        {matchingContextCitationData ? (
          <Link
            href={
              numWords < 1
                ? `${matchingContextCitationData.KnowledgeArticle_QuartoUrl}`
                : `${matchingContextCitationData.KnowledgeArticle_QuartoUrl}#:~:text=${encodeURIComponent(textStart)},${encodeURIComponent(textEnd)}`
            }
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
        <Markdown
          rehypePlugins={[rehypeRaw]}
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
