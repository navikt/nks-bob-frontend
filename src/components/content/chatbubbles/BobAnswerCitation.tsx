import { BodyLong, ExpansionCard } from "@navikt/ds-react";

interface BobAnswerCitationProps {
  citation: {
    title: string;
    text: string;
  };
}

function BobAnswerCitation({ citation }: BobAnswerCitationProps) {
  return (
    <ExpansionCard size="small" aria-label="Sitat fra kunnskapsbasen">
      <ExpansionCard.Header>
        <ExpansionCard.Title as="h4" size="small">
          {citation.title}
        </ExpansionCard.Title>
      </ExpansionCard.Header>
      <ExpansionCard.Content>
        <BodyLong>{citation.text}</BodyLong>
      </ExpansionCard.Content>
    </ExpansionCard>
  );
}

export default BobAnswerCitation;
