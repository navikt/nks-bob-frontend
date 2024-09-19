import { ReactNode } from "react";

interface DialogWrapperProps {
  children: ReactNode;
}

function DialogWrapper({ children }: DialogWrapperProps) {
  return (
    <div className="flex h-full w-full justify-center overflow-scroll bg-bg-default px-4">
      <div className="flex h-full w-full max-w-2xl flex-col items-center">
        {children}
      </div>
    </div>
  );
}

export default DialogWrapper;
