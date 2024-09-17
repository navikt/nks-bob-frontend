import { ReactNode } from "react";

interface PageWrapperProps {
    children: ReactNode;
}

function PageWrapper({ children }: PageWrapperProps) {
    return (
        <div
            className="
            max-w-screen
            w-full
            h-full
            max-h-screen
            overflow-hidden
            "
        >
            {children}
        </div>
    );
}

export default PageWrapper;