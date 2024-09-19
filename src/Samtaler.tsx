import { useParams } from "react-router-dom"
import Content from "./components/content/Content.tsx"

function Samtale() {
  const { conversationId } = useParams()
  return (
    <div className="pagewrapper">
      <Content conversationId={conversationId!} />
    </div>
  )
}

export default Samtale
