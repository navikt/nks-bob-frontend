import {
  BulletListIcon,
  HandHeartIcon,
  LanguageIcon,
  StarFillIcon,
  StarIcon,
} from "@navikt/aksel-icons"
import { Button, CopyButton, Tooltip } from "@navikt/ds-react"
import { useState } from "react"
import { useStarMessage } from "../../../../api/api.ts"
import { Message, NewMessage } from "../../../../types/Message.ts"
import amplitude from "../../../../utils/amplitude.ts"
import { md } from "../../../../utils/markdown.ts"
import { GiveUsFeedback } from "../feedback/GiveUsFeedback.tsx"
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

  function handleEmpathetic() {
    amplitude.svarEndret("forenkle")
    const simplifyMessage: NewMessage = {
      content: isLastMessage
        ? "Gjør svaret mer empatisk"
        : `Gjør svaret mer empatisk:\n${message.content}`,
    }
    onSend(simplifyMessage)
  }

  const copyMessageContent = () => {
    const html = new Blob([md.toHtml(message.content)], { type: "text/html" })

    const plain = new Blob([md.toPlaintext(message.content)], {
      type: "text/plain",
    })

    const data = new ClipboardItem({ "text/html": html, "text/plain": plain })

    return navigator.clipboard.write([data])
  }

  return (
    <div className='fade-in mb-6 ml-[-0.3rem] flex h-fit grow flex-wrap items-center justify-start'>
      <Tooltip content='Kopier svaret'>
        <CopyButton
          copyText=''
          size='small'
          aria-label='Kopier svaret'
          onClick={() => {
            // Wait until `CopyButton` is done before writing to clipboard.
            // This is done in order to copy rich text to the clipboard, instead of passing
            // a string in the `copyText` prop.
            new Promise((resolve) => setTimeout(resolve, 100)).then(() =>
              copyMessageContent(),
            )

            amplitude.svarKopiert(message.id)
          }}
        />
      </Tooltip>
      <GiveUsFeedback message={message} />
      <Tooltip content='Oversett svaret til engelsk'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Oversett svaret til engelsk'
          icon={<LanguageIcon />}
          onClick={handleTranslate}
        />
      </Tooltip>
      <Tooltip content='Gjør svaret om til punktliste'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Gjør svaret om til punktliste'
          icon={<BulletListIcon />}
          onClick={handleBulletList}
        />
      </Tooltip>
      <Tooltip content='Gjør svaret mer empatisk'>
        <Button
          variant='tertiary-neutral'
          size='small'
          aria-label='Gjør svaret mer empatisk'
          icon={<HandHeartIcon />}
          onClick={handleEmpathetic}
        />
      </Tooltip>
      <MessageStar message={message} />

      {/*Funksjon vi ikke skal bruke lengre:*/}

      {/*<Dropdown>*/}
      {/*  <Button*/}
      {/*    variant='tertiary-neutral'*/}
      {/*    size='small'*/}
      {/*    icon={<ArrowsCirclepathIcon />}*/}
      {/*    as={Dropdown.Toggle}*/}
      {/*  >*/}
      {/*    Endre svaret*/}
      {/*  </Button>*/}
      {/*  <Dropdown.Menu>*/}
      {/*    <Dropdown.Menu.GroupedList>*/}
      {/*      <Dropdown.Menu.GroupedList.Item*/}
      {/*        as='button'*/}
      {/*        onClick={handleTranslate}*/}
      {/*      >*/}
      {/*        <Label as='button' size='small'>*/}
      {/*          Oversett til engelsk*/}
      {/*        </Label>*/}
      {/*      </Dropdown.Menu.GroupedList.Item>*/}
      {/*      <Dropdown.Menu.GroupedList.Item*/}
      {/*        as='button'*/}
      {/*        onClick={handleBulletList}*/}
      {/*      >*/}
      {/*        <Label as='button' size='small'>*/}
      {/*          Lag punktliste*/}
      {/*        </Label>*/}
      {/*      </Dropdown.Menu.GroupedList.Item>*/}
      {/*      <Dropdown.Menu.GroupedList.Item*/}
      {/*        as='button'*/}
      {/*        onClick={handleSimplify}*/}
      {/*      >*/}
      {/*        <Label as='button' size='small' className='hover:cursor-pointer'>*/}
      {/*          Forenkle svaret*/}
      {/*        </Label>*/}
      {/*      </Dropdown.Menu.GroupedList.Item>*/}
      {/*    </Dropdown.Menu.GroupedList>*/}
      {/*  </Dropdown.Menu>*/}
      {/*</Dropdown>*/}
    </div>
  )
}

const MessageStar = ({ message }: { message: Message }) => {
  const [starred, setStarred] = useState(message.starred ?? false)
  const { trigger: starMessage, isMutating: isLoading } = useStarMessage(
    message.id,
  )

  const handleStarMessage = () => {
    starMessage()
    setStarred(true)
  }

  return (
    <Tooltip content='Stjernemarker svaret'>
      <Button
        disabled={isLoading || starred}
        variant='tertiary-neutral'
        size='small'
        aria-label='Stjernemarker svaret'
        icon={starred ? <StarFillIcon /> : <StarIcon />}
        onClick={handleStarMessage}
      />
    </Tooltip>
  )
}

export default BobSuggests
