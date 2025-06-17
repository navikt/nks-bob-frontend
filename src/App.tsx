import { Outlet } from "react-router"
import { lazy, Suspense } from "react"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"

// Lazy load AdminMenu component
const AdminMenu = lazy(() => import("./components/content/admin/menu/AdminMenu.tsx"))

function App() {
  return (
    <PageWrapper>
      <Outlet />
      <Suspense fallback={<div></div>}>
        <AdminMenu />
      </Suspense>
    </PageWrapper>
  )
}

export default App
