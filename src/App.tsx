import { Outlet } from "react-router"
import PageWrapper from "./components/content/wrappers/PageWrapper.tsx"
import { InputFieldContextProvider } from "./components/inputfield/InputField.tsx"

function App() {
  return (
    <PageWrapper>
      <InputFieldContextProvider>
        <Outlet />
      </InputFieldContextProvider>
    </PageWrapper>
  )
}

export default App
