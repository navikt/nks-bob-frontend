import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div
      className="
        flex
        h-screen
        max-w-screen
        w-full
        overflow-hidden
        ">
        {children}
    </div>
  );
}

export default ContentWrapper