import { ReactNode } from "react";

interface DialogWrapperProps {
    children: ReactNode;
}

function DialogWrapper({ children }: DialogWrapperProps) {
    return (
        <div className="
        flex
        max-w-full
        w-full
        h-full
        bg-bg-default
        justify-center
        px-4
        overflow-scroll
        ">
            <div className="
            flex
            flex-col
            max-w-3xl
            w-full
            min-h-screen
            items-center
            ">
                {children}
            </div>
        </div>
    );
}

export default DialogWrapper