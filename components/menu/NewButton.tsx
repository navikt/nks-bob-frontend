"use client"

import { NotePencilIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useHotkeys } from "react-hotkeys-hook"
import { useRouter } from "next/navigation"
import { previousConversationStore } from "../../lib/stores/previousConversationStore"
import { useInputFieldStore } from "../inputfield/InputField"

export const NewButton = ({ conversationId }: { conversationId: string }) => {
  const { setInputValue } = useInputFieldStore()
  const router = useRouter()

  const startNew = () => {
    setInputValue("")
    previousConversationStore.getState().set(conversationId)
    router.push("/")
  }

  useHotkeys("Alt+Ctrl+N", startNew, {
    enableOnFormTags: true,
  })

  return (
    <div className='flex self-center'>
      <Tooltip content='Start ny samtale ( Alt+Ctrl+N )'>
        <Button
          data-color='neutral'
          variant='tertiary'
          size='medium'
          icon={<NotePencilIcon aria-hidden />}
          onClick={startNew}
          aria-label='Start ny samtale'
        />
      </Tooltip>
    </div>
  )
}
