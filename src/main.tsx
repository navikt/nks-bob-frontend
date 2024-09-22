import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom"

import App from "./App"
import ExistingConversationContent from "./components/content/ExistingConversationContent"
import NewConversationContent from "./components/content/NewConversationContent"

import "./index.css"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<NewConversationContent />} />
      <Route
        path="samtaler/:conversationId"
        element={<ExistingConversationContent />}
      />
    </Route>,
  ),
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
