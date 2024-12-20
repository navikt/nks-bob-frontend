import { ReactNode } from "react"

interface CreateConversationWrapperProps {
  children: ReactNode
}

function CreateConversationWrapper({
  children,
}: CreateConversationWrapperProps) {
  return <div className='createconversation-wrapper'>{children}</div>
}

export default CreateConversationWrapper
