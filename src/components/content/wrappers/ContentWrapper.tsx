import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
}

function ContentWrapper({ children }: ContentWrapperProps) {
  return <div className="flex h-full w-full">{children}</div>;
}

export default ContentWrapper;
