import { Outlet } from "react-router-dom"
import Header from "./components/header/Header.tsx"

function App() {
  return (
    <div className='pagewrapper'>
      <Header />
      <Outlet />
    </div>
  )
}

export default App
