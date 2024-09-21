import { HStack } from "@navikt/ds-react"

import { HistorikkButton, NewButton } from "./Buttons"

function Menu() {
  return (
    <div className="dialogcontent sticky top-0 z-10 min-h-16 bg-bg-default">
      <HStack justify="start" align="center">
        <HistorikkButton />
        <NewButton />
      </HStack>
    </div>
  )
}

export default Menu
