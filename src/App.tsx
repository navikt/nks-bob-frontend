import { Outlet } from "react-router"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"
import AdminMenu from "./components/content/admin/menu/AdminMenu.tsx"

function App() {
  return (
    <PageWrapper>
      <Outlet />
      <AdminMenu />
    </PageWrapper>
  )
}

export default App
