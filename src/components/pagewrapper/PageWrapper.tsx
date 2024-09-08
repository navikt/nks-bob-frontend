import {ReactNode} from "react";

interface PageWrapperProps {
    children: ReactNode
}

function PageWrapper({ children }: PageWrapperProps) {
    return (
        <div className="flex">
            {children}
        </div>
    )
}

export default PageWrapper