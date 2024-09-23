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

async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return
  }

  const { serviceWorker } = await import("./mocks/browser")
  return serviceWorker.start()
}

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

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
