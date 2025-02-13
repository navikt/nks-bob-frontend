import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"
import TipsFromBob from "./tipsfrombob/TipsFromBob.tsx"

function Header() {
  return (
    <div className='header'>
      <div className='flex max-w-24'>
        <NAVLogo />
      </div>
      <div className='max-h-30 flex h-9 flex-wrap items-center justify-end gap-3'>
        <div className='flex'>
          <TipsFromBob />
        </div>
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
