import { Outlet } from "react-router"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"

function App() {
  return (
    <PageWrapper>
      <Outlet />
    </PageWrapper>
  )
}

export default App
