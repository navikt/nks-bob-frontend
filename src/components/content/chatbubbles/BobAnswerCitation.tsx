import { BodyLong, ExpansionCard } from "@navikt/ds-react";

interface BobAnswerCitationProps {
  citation: {
    title: string;
    text: string;
  };
}

function BobAnswerCitation({ citation }: BobAnswerCitationProps) {
  return (
    <div className="grid gap-6">
      <ExpansionCard size="small" aria-label="Small-variant">
        <ExpansionCard.Header>
          <ExpansionCard.Title size="small">
            {citation.title}
          </ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          <BodyLong>{citation.text}</BodyLong>
        </ExpansionCard.Content>
      </ExpansionCard>
    </div>
  );
}

export default BobAnswerCitation;
