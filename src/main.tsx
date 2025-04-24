import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Helmet } from "react-helmet"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router"
import App from "./App.tsx"
import { preloadErrorNotifications, preloadNewsNotifications, preloadUserConfig } from "./api/api.ts"
import ConversationAdminContent from "./components/content/ConversationAdminContent.tsx"
import ConversationContent from "./components/content/ConversationContent.tsx"
import CreateConversationContent from "./components/content/CreateConversationContent.tsx"
import "./global.css"

preloadUserConfig()
preloadNewsNotifications()
preloadErrorNotifications()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<CreateConversationContent />} />
      <Route
        path='/samtaler/:conversationId'
        element={<ConversationContent />}
      />
      <Route
        path='/admin/:conversationId'
        element={<ConversationAdminContent />}
      />
    </Route>,
  ),
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Helmet>
      <script
        defer
        src='https://cdn.nav.no/team-researchops/sporing/sporing.js'
        data-host-url='https://umami.nav.no'
        data-website-id='7a73382f-ec5b-4c80-b3f2-154388c32234'
        data-domains='bob.ansatt.dev.nav.no,bob.ansatt.nav.no'
      />
    </Helmet>
    <RouterProvider router={router} />
  </StrictMode>,
)
