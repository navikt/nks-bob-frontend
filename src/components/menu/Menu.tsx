import { HStack } from "@navikt/ds-react"
import { NewButton } from "./Buttons.tsx"
import "./Menu.css"

function Menu() {
  return (
    <div className='dialogcontent min-h-16 justify-end px-4'>
      <HStack justify='start' align='center' className='min-h-16'>
        <NewButton />
      </HStack>
    </div>
  )
}

export default Menu
