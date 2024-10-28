import { Button } from "@navikt/ds-react"
import { Message, NewMessage } from "../../../../types/Message.ts"
import "./BobSuggests.css"

interface BobSuggestsProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLastMessage: boolean
}

const BobSuggests = ({ message, onSend, isLastMessage }: BobSuggestsProps) => {
  function handleTranslate() {
    const translate: NewMessage = {
      content: isLastMessage
        ? "Oversett svaret til engelsk."
        : `Oversett dette svaret til engelsk:\n\n${message.content}`,
    }
    onSend(translate)
  }

  function handleBulletList() {
    const bulletList: NewMessage = {
      content: isLastMessage
        ? "Gjør om svaret til punktliste."
        : `Gjør om dette svaret til punktliste:\n\n${message.content}`,
    }
    onSend(bulletList)
  }

  function handleSimplify() {
    const simplifyMessage: NewMessage = {
      content: isLastMessage
        ? "Forenkle svaret."
        : `Forenkle dette svaret:\n\n${message.content}`,
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
