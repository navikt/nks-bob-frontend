import { HStack } from "@navikt/ds-react"
import { HistorikkButton, NewButton } from "./Buttons.tsx"
import "./Menu.css"

function Menu() {
  return (
    <div className="dialogcontent sticky top-0 z-10 flex min-h-16 bg-bg-default px-4">
      <HStack justify="start" align="center" className="min-h-16">
        <HistorikkButton />
        <NewButton />
      </HStack>
    </div>
  )
}

export default Menu
