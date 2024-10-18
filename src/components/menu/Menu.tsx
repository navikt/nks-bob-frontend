import { HStack } from "@navikt/ds-react"
import { NewButton } from "./Buttons.tsx"
import "./Menu.css"

function Menu() {
  return (
    <div className='dialogcontent sticky top-0 z-10 flex min-h-16 justify-end bg-bg-default px-4'>
      <HStack justify='start' align='center' className='min-h-16'>
        <NewButton />
      </HStack>
    </div>
  )
}

export default Menu
