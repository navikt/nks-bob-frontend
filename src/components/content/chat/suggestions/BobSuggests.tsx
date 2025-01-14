import { ArrowsCirclepathIcon } from "@navikt/aksel-icons"
import { Button, CopyButton, Dropdown, Label } from "@navikt/ds-react"
import { Message, NewMessage } from "../../../../types/Message.ts"
import amplitude from "../../../../utils/amplitude.ts"
import { GiveUsFeedback } from "../feedback/GiveUsFeedback.tsx"
import { md } from "../../../../utils/markdown.ts"
import "./BobSuggests.css"

interface BobSuggestsProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLastMessage: boolean
}

const BobSuggests = ({ message, onSend, isLastMessage }: BobSuggestsProps) => {
  function handleTranslate() {
    amplitude.svarEndret("oversett")
    const translate: NewMessage = {
      content: isLastMessage
        ? "Oversett svaret til engelsk"
        : `Oversett til engelsk:\n${message.content}`,
    }
    onSend(translate)
  }

  function handleBulletList() {
    amplitude.svarEndret("punktliste")
    const bulletList: NewMessage = {
      content: isLastMessage
        ? "Gjør om svaret til punktliste"
        : `Gjør om til punktliste:\n${message.content}`,
    }
    onSend(bulletList)
  }

  function handleSimplify() {
    amplitude.svarEndret("forenkle")
    const simplifyMessage: NewMessage = {
      content: isLastMessage
        ? "Forenkle svaret"
        : `Forenkle svaret:\n${message.content}`,
    }
    onSend(simplifyMessage)
  }

  const copyMessageContent = () => {
    const html = new Blob(
      [md.toHtml(message.content)],
      { type: "text/html" }
    )

    const plain = new Blob(
      [md.toPlaintext(message.content)],
      { type: "text/plain" }
    )

    const data = new ClipboardItem({ "text/html": html, "text/plain": plain, })

    return navigator.clipboard.write([data])
  }

  return (
    <div className='fade-in mb-6 ml-[-0.3rem] flex h-fit grow flex-wrap items-center justify-start'>
      <CopyButton
        copyText=''
        size='small'
        text='Kopier'
        activeText='Kopiert'
        onClick={() => {
          // Wait until `CopyButton` is done before writing to clipboard.
          // This is done in order to copy rich text to the clipboard, instead of passing
          // a string in the `copyText` prop.
          new Promise(resolve => setTimeout(resolve, 100))
            .then(() => copyMessageContent())

          amplitude.svarKopiert(message.id)
        }
        }
      />
      <GiveUsFeedback message={message} />

      <Dropdown>
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ArrowsCirclepathIcon />}
          as={Dropdown.Toggle}
        >
          Endre svaret
        </Button>
        <Dropdown.Menu>
          <Dropdown.Menu.GroupedList>
            <Dropdown.Menu.GroupedList.Item
              as='button'
              onClick={handleTranslate}
            >
              <Label as='button' size='small'>
                Oversett til engelsk
              </Label>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item
              as='button'
              onClick={handleBulletList}
            >
              <Label as='button' size='small'>
                Lag punktliste
              </Label>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item
              as='button'
              onClick={handleSimplify}
            >
              <Label as='button' size='small' className='hover:cursor-pointer'>
                Forenkle svaret
              </Label>
            </Dropdown.Menu.GroupedList.Item>
          </Dropdown.Menu.GroupedList>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

export default BobSuggests
