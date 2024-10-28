import { Outlet } from "react-router-dom"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"

function App() {
  return (
    <PageWrapper>
      <Outlet />
    </PageWrapper>
  )
}

export default App
