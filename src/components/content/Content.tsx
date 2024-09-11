import BobPlaceHolder from "./BobPlaceHolder.tsx";
import InputField from "../inputfield/InputField.tsx"
import ChatDialog from "./ChatDialog.tsx";
import {useState} from "react";
import {Message} from "../../types/Message.ts";

function Content() {
    const [userMessage, setUserMessage] = useState<Message | undefined>(undefined);

    function handleUserMessage(message: Message) {
        setUserMessage(message)
    }

    return (
        <div className="flex justify-center h-full w-full flex-col">
            <BobPlaceHolder />
            <ChatDialog message={userMessage} />
            <InputField onSend={handleUserMessage} />
        </div>
    )
}

export default Content