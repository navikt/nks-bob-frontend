import { ReactNode } from "react";

interface DialogWrapperProps {
  children: ReactNode;
}

function DialogWrapper({ children }: DialogWrapperProps) {
  return (
    <div className="flex h-full w-full max-w-full justify-center overflow-scroll bg-bg-default px-4">
      <div className="flex min-h-screen w-full max-w-3xl flex-col items-center">
        {children}
      </div>
    </div>
  );
}

export default DialogWrapper;
