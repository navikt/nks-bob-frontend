import { Button } from "@navikt/ds-react"
import { Message, NewMessage } from "../../../../types/Message.ts"
import "./BobSuggests.css"

interface BobSuggestsProps {
  message: Message
  onSend: (message: NewMessage) => void
}

const BobSuggests = ({ message, onSend }: BobSuggestsProps) => {
  function handleTranslate() {
    const translate: NewMessage = {
      content: `Oversett dette svaret til engelsk:\n\n${message.content}`,
    }
    onSend(translate)
  }

  function handleBulletList() {
    const bulletList: NewMessage = {
      content: `Gjør om dette svaret til punktliste:\n\n${message.content}`,
    }
    onSend(bulletList)
  }

  function handleSimplify() {
    const simplifyMessage: NewMessage = {
      content: `Forenkle dette svaret:\n\n${message.content}`,
    }
    onSend(simplifyMessage)
  }

  return (
    <div className='mb-3 ml-[-0.7rem] flex h-fit grow flex-wrap items-center justify-start gap-3'>
      <Button
        variant='tertiary-neutral'
        size='small'
        onClick={handleTranslate}
        className='navds-button'
      >
        Oversett til engelsk
      </Button>
      <Button
        variant='tertiary-neutral'
        size='small'
        onClick={handleBulletList}
      >
        Lag punktliste
      </Button>
      <Button variant='tertiary-neutral' size='small' onClick={handleSimplify}>
        Forenkle svaret
      </Button>
    </div>
  )
}

export default BobSuggests
