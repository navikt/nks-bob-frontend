import { Chat, Heading, HStack, VStack } from "@navikt/ds-react";

import Markdown from "react-markdown";
import Bobhead from "../../../assets/Bob-hode-svg.svg";
import { Message } from "../../../types/Message";
import BobAnswerCitation from "./BobAnswerCitation.tsx";

function BobAnswerBubble({ answer }: { answer: Message }) {
  return (
    <VStack gap="10" align="stretch">
      <HStack gap="3" align="end" wrap={false} width="full">
        <img src={Bobhead} alt="Bob" width="50px" className="hidehead" />
        <Chat variant="info" className="flex w-full">
          <Chat.Bubble>
            <Markdown>{answer.content}</Markdown>
          </Chat.Bubble>
        </Chat>
      </HStack>
      {answer.citations?.length > 0 && (
        <VStack gap="3" align="stretch" className="pl-16">
          <Heading as="h5" size="xsmall">
            Referanser
          </Heading>
          {answer.citations.map((citation) => (
            <BobAnswerCitation citation={citation} key={citation.id} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default BobAnswerBubble;
