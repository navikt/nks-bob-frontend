import { Chat, HStack, VStack } from "@navikt/ds-react";

import Markdown from "react-markdown";
import Bobhead from "../../../assets/Bob-hode-svg.svg";
import { Message } from "../../../types/Message";

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
    </VStack>
  );
}

export default BobAnswerBubble;
