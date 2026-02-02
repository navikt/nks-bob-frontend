import { StrictMode, lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router"
import { SWRConfig } from "swr"
import { createHead, UnheadProvider } from "@unhead/react/client"
import App from "./App.tsx"
import { preloadAlerts, preloadNewsNotifications, preloadUserConfig, triggerReAuth } from "./api/api.ts"
import "./global.css"
import { AnalyticsProvider } from "./utils/AnalyticsProvider.tsx"
import { ThemeProvider } from "./components/menu/darkmode/DarkModeToggle.tsx"

const head = createHead()

// Lazy load components to reduce initial bundle size
const CreateConversationContent = lazy(() => import("./components/content/CreateConversationContent.tsx"))
const ConversationContent = lazy(() => import("./components/content/ConversationContent.tsx"))
const ConversationAdminContent = lazy(() => import("./components/content/ConversationAdminContent.tsx"))

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className='flex h-full w-full items-center justify-center'>
    <div className='animate-pulse text-lg'>Laster...</div>
  </div>
)

preloadUserConfig()
preloadNewsNotifications()
preloadAlerts()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path='/'
      element={<App />}
    >
      <Route
        index
        element={
          <Suspense fallback={<LoadingFallback />}>
            <CreateConversationContent />
          </Suspense>
        }
      />
      <Route
        path='/samtaler/:conversationId'
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ConversationContent />
          </Suspense>
        }
      />
      <Route
        path='/admin/:conversationId'
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ConversationAdminContent />
          </Suspense>
        }
      />
    </Route>,
  ),
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <UnheadProvider head={head}>
        <SWRConfig
          value={{
            onError: (err) => {
              if (err.status === 401) {
                triggerReAuth()
              }
            },
          }}
        >
          <AnalyticsProvider />
          <RouterProvider router={router} />
        </SWRConfig>
      </UnheadProvider>
    </ThemeProvider>
  </StrictMode>,
)
