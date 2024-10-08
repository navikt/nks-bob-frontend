import { BodyShort, Box, Heading } from "@navikt/ds-react"

interface BobAnswerCitationProps {
  citation: {
    title: string
    text: string
  }
}

function BobAnswerCitation({ citation }: BobAnswerCitationProps) {
  return (
    <Box padding='4' className='flex flex-col gap-2 bg-bg-subtle'>
      <Heading size='xsmall'>{citation.title}</Heading>
      <BodyShort className='italic'>{citation.text}</BodyShort>
    </Box>
  )
}

// https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/Sykepenger/kA02o000000M7qQCAS.html#ag-mer-informasjon

export default BobAnswerCitation
