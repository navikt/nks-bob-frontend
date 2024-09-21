import { useParams } from "react-router-dom"

import ExistingConversationContent from "./components/content/ExistingConversationContent"

function Samtale() {
  const { conversationId } = useParams()
  return (
    <div className="pagewrapper">
      <ExistingConversationContent conversationId={conversationId!} />
    </div>
  )
}

export default Samtale
