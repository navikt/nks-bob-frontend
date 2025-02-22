import { NewButton } from "../menu/NewButton.tsx"
import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"
import TipsFromBob from "./tipsfrombob/TipsFromBob.tsx"

interface HeaderProps {
  conversation: string | undefined
}

function Header({ conversation }: HeaderProps) {
  return (
    <div className='header'>
      <div className='flex max-w-24'>
        <NAVLogo />
      </div>
      <div className='max-h-30 flex h-full gap-3'>
        <div className='flex'>
          {conversation && <NewButton conversationId={conversation} />}
          <TipsFromBob />
        </div>
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
