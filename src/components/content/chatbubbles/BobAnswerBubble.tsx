import { Chat, HStack } from "@navikt/ds-react";

import bobhead from "../../../assets/Bob-hode-svg.svg";
import { Message } from "../../../types/Message";

function BobAnswerBubble({ answer }: { answer: Message }) {
  return (
    <HStack gap="3" align="end" wrap={false} width="full">
      <img src={bobhead} alt="Bob" width="50px" className="hidehead" />
      <Chat variant="info" className="flex w-full">
        <Chat.Bubble>{answer.content}</Chat.Bubble>
      </Chat>
    </HStack>
  );
}

export default BobAnswerBubble;
