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
import ConversationContent from "./components/content/ConversationContent.tsx"
import CreateConversationContent from "./components/content/CreateConversationContent.tsx"
import "./global.css"
import { useMessagesSubscription } from "./api/ws.ts"

preloadUserConfig()

const RootElement = () => {
  const { } = useMessagesSubscription()

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={ <CreateConversationContent /> } />
      <Route
        path='/samtaler/:conversationId'
        element={ <ConversationContent /> }
      />
    </Route>,
  ),
)

return <RouterProvider router={router} />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootElement />
  </StrictMode>,
)
