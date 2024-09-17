import { ReactNode } from "react";

interface ChatDialogWrapperProps {
    children: ReactNode;
}

function ChatDialogWrapper({ children }: ChatDialogWrapperProps) {
    return (
        <div className="
        flex
        w-screen
        bg-bg-default
        justify-center
        overflow-scroll
        px-4
        ">
            <div className="
            flex-col
            max-w-3xl
            w-full">
                {children}
            </div>
        </div>
    );
}

export default ChatDialogWrapper