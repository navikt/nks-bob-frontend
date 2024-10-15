import { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
}

function ContentWrapper({ children }: ContentWrapperProps) {
  return <div className='contentwrapper'>{children}</div>
}

export default ContentWrapper
