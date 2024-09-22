import { NotePencilIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { Link } from "react-router-dom"

import "./StartNewConversationButton.css"

const StartNewConversationButton = () => {
  return (
    <Link to="/">
      <Button
        variant="tertiary"
        size="medium"
        icon={<NotePencilIcon aria-hidden />}
        className="StartNewConversationButton"
      >
        Ny chat
      </Button>
    </Link>
  )
}

export default StartNewConversationButton
