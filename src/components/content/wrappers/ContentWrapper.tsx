import { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
}

function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className='flex h-full w-full flex-col overflow-hidden'>
      {children}
    </div>
  )
}

export default ContentWrapper
