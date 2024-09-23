import { BodyShort, Button } from "@navikt/ds-react"
import clsx from "clsx"
import * as ReactRouter from "react-router-dom"
import { useLocation } from "react-router-dom"

import { Conversation } from "../../types/message"

import "./ConversationLink.css"

interface ConversationLinkProps {
  conversation: Conversation
}

function ConversationLink({ conversation }: ConversationLinkProps) {
  const location = useLocation()
  const isActive = location.pathname === `/samtaler/${conversation.id}`

  return (
    <div className="ConversationLink">
      <Button
        size="small"
        variant="tertiary-neutral"
        as={ReactRouter.Link}
        to={`/samtaler/${conversation.id}`}
        className={clsx("ConversationLink__button flex grow justify-start", {
          "bg-surface-neutral-subtle": isActive,
        })}
      >
        <BodyShort
          size="small"
          weight={isActive ? "semibold" : "regular"}
          className="ConversationLink__button--text-overflow"
        >
          {conversation.title}
        </BodyShort>
      </Button>
    </div>
  )
}

export default ConversationLink
