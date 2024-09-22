import { Chat, HStack } from "@navikt/ds-react";

import Markdown from "react-markdown";
import Bobhead from "../../../assets/Bob-hode-svg.svg";
import { Message } from "../../../types/Message";
import BobAnswerCitation from "./BobAnswerCitation.tsx";

function BobAnswerBubble({ answer }: { answer: Message }) {
  return (
    <HStack gap="3" align="end" wrap={false} width="full">
      <img src={Bobhead} alt="Bob" width="50px" className="hidehead" />
      <Chat variant="info" className="flex w-full">
        <Chat.Bubble>
          <Markdown>{answer.content}</Markdown>
          {answer.citations.map((citation) => (
            <BobAnswerCitation citation={citation} key={citation.id} />
          ))}
        </Chat.Bubble>
      </Chat>
    </HStack>
  );
}

export default BobAnswerBubble;
