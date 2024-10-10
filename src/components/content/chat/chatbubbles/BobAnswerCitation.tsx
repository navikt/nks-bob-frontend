import { BodyLong, ExpansionCard } from "@navikt/ds-react"

interface BobAnswerCitationProps {
  citation: {
    title: string
    text: string
    section: string
  }
}

function BobAnswerCitation({ citation }: BobAnswerCitationProps) {
  return (
    <ExpansionCard size='small' aria-label='Small-variant med description'>
      <ExpansionCard.Header>
        <ExpansionCard.Title>{citation.title}</ExpansionCard.Title>
        <ExpansionCard.Description>
          {citation.section}
        </ExpansionCard.Description>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <BodyLong className='italic'>{citation.text}</BodyLong>
      </ExpansionCard.Content>
    </ExpansionCard>
  )
}

// https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Sykepenger/kA02o000000M7qQCAS.html#ag-mer-informasjon

export default BobAnswerCitation
