import {Message} from "../../types/Message.ts";

interface ChatDialogProps {
    message?: Message
}

// Husk funksjon for at man må vente til Bob
// har svart før man kan sende ny message.

function ChatDialog({message}: ChatDialogProps ) {
    return (
        <div>
            {message?.text}
        </div>
    )
}

export default ChatDialog