import { ReactNode } from "react";

interface DialogWrapperProps {
  children: ReactNode;
}

function DialogWrapper({ children }: DialogWrapperProps) {
  return <div className="dialogwrapper">{children}</div>;
}

export default DialogWrapper;
