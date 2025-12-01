import { Outlet } from "react-router"
import { lazy, Suspense } from "react"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"
import { useAppVersionCheck } from "./api/api.ts"

// Lazy load AdminMenu component
const AdminMenu = lazy(() => import("./components/content/admin/menu/AdminMenu.tsx"))

function App() {
  useAppVersionCheck()
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
