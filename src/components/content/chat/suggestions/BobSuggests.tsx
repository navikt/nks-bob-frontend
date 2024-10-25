import { Button, Label } from "@navikt/ds-react"
import { Message, NewMessage } from "../../../../types/Message.ts"

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
      content: `Lag dette svaret med punktliste:\n\n
${message.content}`,
    }
    onSend(bulletList)
  }

  function handleEmpathic() {
    const bulletList: NewMessage = {
      content: `Lag dette svaret mer empatisk:\n\n
${message.content}`,
    }
    onSend(bulletList)
  }

  return (
    <div className='mb-6 flex h-6 items-center'>
      <Label size='small'>Forslag fra Bob:</Label>
      <Button variant='tertiary-neutral' size='small' onClick={handleTranslate}>
        Oversett til engelsk
      </Button>
      <Button
        variant='tertiary-neutral'
        size='small'
        onClick={handleBulletList}
      >
        Lag punktliste
      </Button>
      <Button variant='tertiary-neutral' size='small' onClick={handleEmpathic}>
        Lag mer empatisk svar
      </Button>
    </div>
  )
}

export default BobSuggests
