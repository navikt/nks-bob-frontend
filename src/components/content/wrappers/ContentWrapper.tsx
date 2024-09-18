import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className="max-w-screen flex h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}

export default ContentWrapper;
