import { HStack } from "@navikt/ds-react"

import OpenHistorySidebarButton from "./buttons/OpenHistorySidebarButton"
import StartNewConversationButton from "./buttons/StartNewConversationButton"

function Menu() {
  return (
    <div className="dialogcontent sticky top-0 z-10 min-h-16 bg-bg-default">
      <HStack justify="start" align="center">
        <OpenHistorySidebarButton />
        <StartNewConversationButton />
      </HStack>
    </div>
  )
}

export default Menu
