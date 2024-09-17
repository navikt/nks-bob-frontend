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
        overflow-scroll
        px-4
        ">
            <div className="
            flex-col
            max-w-3xl
            w-full
            h-full
            ">
                {children}
            </div>
        </div>
    );
}

export default DialogWrapper