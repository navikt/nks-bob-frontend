"use client"

import { ArrowCirclepathReverseIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { previousConversationStore } from "../../../lib/stores/previousConversationStore"

const RegretNewButton = () => {
  const fromConversationId = previousConversationStore((s) => s.fromConversationId)
  const router = useRouter()
  const [showText, setShowText] = useState(true)

  useEffect(() => {
    if (fromConversationId) {
      const timer = setTimeout(() => setShowText(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [fromConversationId])

  const handleClick = () => {
    previousConversationStore.getState().clear()
    router.push(`/samtaler/${fromConversationId}`)
  }

  return (
    <>
      {fromConversationId ? (
        <Tooltip content='Angre ny samtale'>
          <Button
            data-color='danger'
            className='fade-in mr-2'
            variant='tertiary'
            size='small'
            icon={<ArrowCirclepathReverseIcon />}
            onClick={handleClick}
          >
            {showText && "Angre ny samtale"}
          </Button>
        </Tooltip>
      ) : null}
    </>
  )
}

export default RegretNewButton
