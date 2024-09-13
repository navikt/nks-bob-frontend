import { Chat, HStack } from "@navikt/ds-react";

import bobhead from "../../../assets/Bob-hode-svg.svg";

function BobAnswerBubble() {
  return (
    <HStack gap="3" wrap={false}>
      <img src={bobhead} alt="Bob" width="50px" className="hidehead" />
      <Chat variant="info" className="flex grow">
        <Chat.Bubble>Svar fra Bob.</Chat.Bubble>
      </Chat>
    </HStack>
  );
}

export default BobAnswerBubble;
