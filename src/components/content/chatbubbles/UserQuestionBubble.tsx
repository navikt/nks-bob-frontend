import { Chat } from "@navikt/ds-react";
import { Message } from "../../../types/Message.ts";

interface UserChatBubbleProps {
    userQuestion?: Message
}

function UserQuestionBubble( {userQuestion}: UserChatBubbleProps ) {
    return (
        <Chat
            variant="subtle"
            position="right"
        >
            <Chat.Bubble className="max-w-prose">{userQuestion?.text}</Chat.Bubble>
        </Chat>

    )
}

export default UserQuestionBubble