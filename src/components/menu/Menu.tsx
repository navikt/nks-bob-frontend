import { NewButton } from "./Buttons.tsx"
import DarkModeToggle from "./darkmode/DarkModeSwitch.tsx"
import "./Menu.css"

function Menu() {
  return (
    <div className='dialogcontent max-h-16 grow p-4'>
      <div className='flex h-full grow items-center justify-between'>
        <DarkModeToggle />
        <NewButton />
      </div>
    </div>
  )
}

export default Menu
