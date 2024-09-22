import { NotePencilIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import * as ReactRouter from "react-router-dom"

import "./StartNewConversationButton.css"

const StartNewConversationButton = () => {
  return (
    <Button
      variant="tertiary"
      as={ReactRouter.Link}
      to="/"
      size="medium"
      icon={<NotePencilIcon aria-hidden />}
      className="StartNewConversationButton"
    >
      Ny chat
    </Button>
  )
}

export default StartNewConversationButton
