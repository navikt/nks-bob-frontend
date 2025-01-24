import { ReactNode } from "react"
import { LoginBoundary } from "../../LoginBoundary"

interface PageWrapperProps {
  children: ReactNode
}

function PageWrapper({ children }: PageWrapperProps) {
  return (
    <LoginBoundary>
      <div className='pagewrapper'>
        {children}
      </div>
    </LoginBoundary>
  )
}

export default PageWrapper
