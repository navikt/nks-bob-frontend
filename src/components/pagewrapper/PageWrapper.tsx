import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div
      className="
        flex
        flex-col
        max-w-3xl
        mx-auto
        px-4
        mt-48
        "
    >
      {children}
    </div>
  );
}

export default PageWrapper;
