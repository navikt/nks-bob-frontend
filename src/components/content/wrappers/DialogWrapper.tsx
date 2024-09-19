import { ReactNode } from "react";

interface DialogWrapperProps {
  children: ReactNode;
}

function DialogWrapper({ children }: DialogWrapperProps) {
  return (
    <div className="dialogwrapper">
      <div className="dialogcontentwrapper">{children}</div>
    </div>
  );
}

export default DialogWrapper;
