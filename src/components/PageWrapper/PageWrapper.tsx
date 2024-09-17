import { ReactNode } from "react";

interface PageWrapperProps {
    children: ReactNode;
}

function PageWrapper({ children }: PageWrapperProps) {
    return (
        <div
            className="
            h-screen
            w-screen
            overflow-hidden
            "
        >
            {children}
        </div>
    );
}

export default PageWrapper;