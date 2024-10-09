import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"
import App from "./App.tsx"
import ConversationContent from "./components/content/ConversationContent.tsx"
import CreateConversationContent from "./components/content/CreateConversationContent.tsx"
import "./global.css"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<CreateConversationContent />} />
      <Route
        path='/samtaler/:conversationId'
        element={<ConversationContent />}
      />
    </Route>,
  ),
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
