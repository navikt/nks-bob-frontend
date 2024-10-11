import { ExternalLinkIcon } from "@navikt/aksel-icons"
import { BodyShort, ExpansionCard, Link } from "@navikt/ds-react"
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

  return (
    <ExpansionCard
      size='small'
      aria-label='Sitat fra kunnskapsartiklene'
      defaultOpen={true}
    >
      <ExpansionCard.Header>
        <ExpansionCard.Title as='h4' size='small'>
          {citation.title}
        </ExpansionCard.Title>
        <ExpansionCard.Description>
          Hentet fra: {citation.section}
        </ExpansionCard.Description>
      </ExpansionCard.Header>
      <ExpansionCard.Content className='gap-4'>
        <Markdown className='mb-4 italic'>{citation.text}</Markdown>
        {matchingContextCitationData ? (
          <Link
            href={matchingContextCitationData.KnowledgeArticle_QuartoUrl}
            target='_blank'
          >
            Åpne artikkelen i ny fane
            <ExternalLinkIcon title='Åpne artikkelen i ny fane' />
          </Link>
        ) : (
          <BodyShort size='medium'>
            Kunne ikke finne lenke til artikkelen.
          </BodyShort>
        )}
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}

export default BobAnswerCitations
