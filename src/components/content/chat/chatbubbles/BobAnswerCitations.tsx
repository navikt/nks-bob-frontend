import { BodyLong, ExpansionCard, Link } from "@navikt/ds-react"
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
  const matchingMetadata = context
    .flatMap((ctx) => ctx.metadata)
    .find(
      (metadata) =>
        metadata.Title === citation.title &&
        metadata.Section === citation.section &&
        metadata.KnowledgeArticleId === citation.article,
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
        <BodyLong className='italic'>{citation.text}</BodyLong>
        {matchingMetadata && (
          <Link
            href={matchingMetadata.KnowledgeArticle_QuartoUrl}
            target='_blank'
          >
            Åpne artikkelen i ny fane
          </Link>
        )}
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}

// https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Sykepenger/kA02o000000M7qQCAS.html#ag-mer-informasjon

export default BobAnswerCitations
