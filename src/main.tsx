import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router"
import App from "./App.tsx"
import { preloadUserConfig } from "./api/api.ts"
import ConversationAdminContent from "./components/content/ConversationAdminContent.tsx"
import ConversationContent from "./components/content/ConversationContent.tsx"
import ConversationGuideContent from "./components/content/ConversationGuideContent.tsx"
import CreateConversationContent from "./components/content/CreateConversationContent.tsx"
import "./global.css"

preloadUserConfig()

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
      <Route path='/guide' element={<ConversationGuideContent />} />
    </Route>,
  ),
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
