import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"

function Header() {
  return (
    <div className='create-conversation max-sm:px-4'>
      <div className='flex w-14'>
        <NAVLogo />
      </div>
      <DarkModeToggle />
    </div>
  )
}

export default Header
