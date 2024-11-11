import { NewButton } from "../menu/Buttons.tsx"
import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"
import TipsFromBob from "./tipsfrombob/TipsFromBob.tsx"

interface HeaderProps {
  conversation: string | undefined
}

function Header({ conversation }: HeaderProps) {
  return (
    <div className='header max-lg:px-4'>
      <div className='flex max-w-24'>
        <NAVLogo />
      </div>
      <div className='max-h-30 flex h-9 flex-wrap items-center justify-end gap-4'>
        {conversation && (
          <div className='hide-on-mobile'>
            <NewButton />
          </div>
        )}
        <TipsFromBob />
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
