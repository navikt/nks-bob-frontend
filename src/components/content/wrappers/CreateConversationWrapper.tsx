import { ReactNode } from "react"

interface CreateConversationWrapperProps {
  children: ReactNode
}

function CreateConversationWrapper({ children }: CreateConversationWrapperProps) {
  return <div className='createconversation-wrapper bg-ax-brand-magenta-100 dark:bg-ax-bg-default'>{children}</div>
}

export default CreateConversationWrapper
