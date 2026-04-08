"use client"

import { lazy, Suspense } from "react"
import PageWrapper from "@/components/content/wrappers/PageWrapper"
import { PasteInfoModal } from "@/components/infomodals/pasteinfomodal/PasteInfoModal"

const AdminMenu = lazy(() => import("@/components/content/admin/menu/AdminMenu"))

const LoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="animate-pulse text-lg">Laster...</div>
  </div>
)

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PageWrapper>
      <PasteInfoModal />
      {children}
      <Suspense fallback={<div></div>}>
        <AdminMenu />
      </Suspense>
    </PageWrapper>
  )
}

export { LoadingFallback }
