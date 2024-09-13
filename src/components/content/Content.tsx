import BobPlaceHolder from "./BobPlaceHolder.tsx";
import InputField from "../inputfield/InputField.tsx"
import ChatDialog from "./ChatDialog.tsx";
import {useState} from "react";
import {Message} from "../../types/Message.ts";
import Menu from "../menu/Menu.tsx";

function Content() {
    const [newMessage, setNewMessage] = useState<Message | undefined>(undefined);

    function handleUserMessage(message: Message) {
        setNewMessage(message)
    }

    function handleNewChatClick() {
        setNewMessage(undefined)
    }

    return (
        <div className="flex flex-col justify-center h-full w-full">
            <Menu onNewChatClick={handleNewChatClick} />
            {!newMessage ? <BobPlaceHolder /> :
                <ChatDialog newMessage={newMessage} />}
            <InputField onSend={handleUserMessage} />
        </div>
    )
}

export default Content