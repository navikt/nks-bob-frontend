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
    <div className='create-conversation max-lg:px-4'>
      <div className='flex w-14'>
        <NAVLogo />
      </div>
      <div className='max-h-30 flex h-9 items-center gap-4'>
        {conversation && <NewButton />}
        <TipsFromBob />
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
