import { Box, Heading } from "@navikt/ds-react";

interface BobAnswerCitationProps {
  citation: {
    title: string;
    text: string;
  };
}

function BobAnswerCitation({ citation }: BobAnswerCitationProps) {
  return (
    <Box padding="4" className="flex flex-col gap-2 bg-bg-subtle">
      <Heading size="xsmall">{citation.title}</Heading>
      {citation.text}
    </Box>
  );
}

export default BobAnswerCitation;
