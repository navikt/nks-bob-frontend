import {ReactNode} from "react";

interface PageWrapperProps {
    children: ReactNode
}

function PageWrapper({ children }: PageWrapperProps) {
    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto">
            {children}
        </div>
    )
}

export default PageWrapper