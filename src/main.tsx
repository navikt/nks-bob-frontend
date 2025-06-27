import { StrictMode, lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import {
  createBrowserRouter,
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router"
import { SWRConfig } from "swr"
import { createHead, UnheadProvider } from "@unhead/react/client"
import App from "./App.tsx"
import {
  preloadAlerts,
  preloadNewsNotifications,
  preloadUserConfig,
  triggerReAuth,
} from "./api/api.ts"
import "./global.css"
import { AnalyticsProvider } from "./utils/AnalyticsProvider.tsx"
import { setupIframeMessageListener } from "./utils/iframe.ts"
import { MsalProvider } from "./auth/MsalProvider.tsx"

const head = createHead()

// Lazy load components to reduce initial bundle size
const CreateConversationContent = lazy(
  () => import("./components/content/CreateConversationContent.tsx"),
)
const ConversationContent = lazy(
  () => import("./components/content/ConversationContent.tsx"),
)
const ConversationAdminContent = lazy(
  () => import("./components/content/ConversationAdminContent.tsx"),
)
const AuthSuccess = lazy(() => import("./components/auth/AuthSuccess.tsx"))

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className='flex h-full w-full items-center justify-center'>
    <div className='animate-pulse text-lg'>Laster...</div>
  </div>
)

preloadUserConfig()
preloadNewsNotifications()
preloadAlerts()

// Initialize iframe communication for Salesforce mode
setupIframeMessageListener()

// Check if this is a Salesforce build
const isSalesforceMode = import.meta.env.VITE_SALESFORCE_BUILD === "true"

// Create routes configuration
const routes = createRoutesFromElements(
  <Route path='/' element={<App />}>
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
    <Route
      path='/auth/success'
      element={
        <Suspense fallback={<LoadingFallback />}>
          <AuthSuccess />
        </Suspense>
      }
    />
  </Route>,
)

// Create router based on environment
const router = isSalesforceMode
  ? createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 0,
    })
  : createBrowserRouter(routes)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider>
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
    </MsalProvider>
  </StrictMode>,
)
