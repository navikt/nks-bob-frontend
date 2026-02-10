import { NotePencilIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate } from "react-router"
import { useInputFieldStore } from "../inputfield/InputField"

export const NewButton = ({ conversationId }: { conversationId: string }) => {
  const { setInputValue } = useInputFieldStore()
  const navigate = useNavigate()

  const startNew = () => {
    setInputValue("")
    navigate("/", { state: { from: conversationId }, viewTransition: true })
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
