import { NewButton } from "./Buttons.tsx"
import "./Menu.css"

function Menu() {
  return (
    <div className='dialogcontent max-h-16 grow p-4'>
      <div className='flex h-full grow items-center justify-end'>
        <NewButton />
      </div>
    </div>
  )
}

export default Menu
