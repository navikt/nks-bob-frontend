import { ReactNode } from "react"

interface DialogWrapperProps {
  children: ReactNode
}

function DialogWrapper({ children }: DialogWrapperProps) {
  return (
    <div className="relative flex h-auto w-full flex-col items-center overflow-y-auto">
      {children}
    </div>
  )
}

export default DialogWrapper
