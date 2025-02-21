import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  useNavigate,
} from "react-router"
import App from "./App.tsx"
import { preloadUserConfig, useUserConfig } from "./api/api.ts"
import ConversationAdminContent from "./components/content/ConversationAdminContent.tsx"
import ConversationContent from "./components/content/ConversationContent.tsx"
import CreateConversationContent from "./components/content/CreateConversationContent.tsx"
import FirstTimeLoginContent from "./components/content/FirstTimeLoginContent.tsx"
import "./global.css"

preloadUserConfig()

export const CheckUserConfig = () => {
  const navigate = useNavigate()
  const { userConfig } = useUserConfig()

  if (userConfig?.showStartInfo) {
    navigate("/first-time-login")
  }
  return null
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<CreateConversationContent />} />
      <Route path='first-time-login' element={<FirstTimeLoginContent />} />
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
    <RouterProvider router={router} />
  </StrictMode>,
)
