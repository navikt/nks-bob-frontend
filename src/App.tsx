import { lazy, Suspense } from "react"
import { Outlet } from "react-router"
import { useAppVersionCheck } from "./api/api.ts"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"
import { PasteInfoModal } from "./components/infomodals/pasteinfomodal/PasteInfoModal.tsx"

// Lazy load AdminMenu component
const AdminMenu = lazy(() => import("./components/content/admin/menu/AdminMenu.tsx"))

function App() {
  useAppVersionCheck()
  return (
    <PageWrapper>
      <PasteInfoModal />
      <Outlet />
      <Suspense fallback={<div></div>}>
        <AdminMenu />
      </Suspense>
    </PageWrapper>
  )
}

export default App
