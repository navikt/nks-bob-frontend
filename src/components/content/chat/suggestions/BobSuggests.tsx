import {
  BulletListIcon,
  FilesIcon,
  HandShakeHeartIcon,
  LanguageIcon,
  PersonIcon,
  StarFillIcon,
  StarIcon,
} from "@navikt/aksel-icons"
import { Button, CopyButton, Tooltip } from "@navikt/ds-react"
import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useStarMessage } from "../../../../api/api.ts"
import { Message, NewMessage } from "../../../../types/Message.ts"
import analytics from "../../../../utils/analytics.ts"
import { md } from "../../../../utils/markdown.ts"
import { FeedbackOnAnswer } from "../feedback/GiveUsFeedback.tsx"
import "./BobSuggests.css"

interface BobSuggestsProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLastMessage: boolean
}

const BobSuggests = ({ message, onSend, isLastMessage }: BobSuggestsProps) => {
  const plaintextMessageContent = md.toPlaintext(message.content)

  function handleTranslate() {
    analytics.svarEndret("oversett")
    const translate: NewMessage = {
      content: isLastMessage
        ? "Oversett svaret til engelsk"
        : `Oversett svaret til engelsk:\n${plaintextMessageContent}`,
    }
    onSend(translate)
  }

  function handleBulletList() {
    analytics.svarEndret("punktliste")
    const bulletList: NewMessage = {
      content: isLastMessage
        ? "Gjør om svaret til punktliste"
        : `Gjør om svaret til punktliste:\n${plaintextMessageContent}`,
    }
    onSend(bulletList)
  }

  function handleEmpathetic() {
    analytics.svarEndret("empatisk")
    const simplifyMessage: NewMessage = {
      content: isLastMessage ? "Gjør svaret mer empatisk" : `Gjør svaret mer empatisk:\n${plaintextMessageContent}`,
    }
    onSend(simplifyMessage)
  }

  function handleDuForm() {
    analytics.svarEndret("du-form")
    const simplifyMessage: NewMessage = {
      content: isLastMessage ? "Gjør om svaret til du-form" : `Gjør om svaret til du-form:\n${plaintextMessageContent}`,
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

  useHotkeys("alt+ctrl+c", () => new Promise((resolve) => setTimeout(resolve, 100)).then(() => copyMessageContent()), {
    enableOnFormTags: true,
  })

  return (
    <div className='fade-in background-color ml-[-0.3rem] flex h-fit w-fit flex-wrap items-center justify-start rounded-sm'>
      <Tooltip content={`${isLastMessage ? "Kopier svaret ( Alt+Ctrl+C )" : "Kopier svaret"}`}>
        <CopyButton
          copyText=''
          size='small'
          aria-label='Kopier svaret'
          icon={
            <FilesIcon
              aria-hidden
              fontSize='1.25rem'
            />
          }
          onClick={() => {
            new Promise((resolve) => setTimeout(resolve, 100)).then(() => copyMessageContent())

            analytics.svarKopiert(message.id)
          }}
        />
      </Tooltip>
      <FeedbackOnAnswer message={message} />
      <MessageStar message={message} />
      <Tooltip
        content={`${isLastMessage ? "Oversett svaret til engelsk ( Alt+Ctrl+O )" : "Oversett svaret til engelsk"}`}
      >
        <Button
          data-color='neutral'
          variant='tertiary'
          size='small'
          aria-label='Oversett svaret til engelsk'
          icon={<LanguageIcon fontSize='1.25rem' />}
          onClick={handleTranslate}
        />
      </Tooltip>
      <Tooltip
        content={`${isLastMessage ? "Gjør om svaret til punktliste ( Alt+Ctrl+P )" : "Gjør om svaret til punktliste"}`}
      >
        <Button
          data-color='neutral'
          variant='tertiary'
          size='small'
          aria-label='Gjør om svaret til punktliste'
          icon={<BulletListIcon fontSize='1.25rem' />}
          onClick={handleBulletList}
        />
      </Tooltip>
      <Tooltip content={`${isLastMessage ? "Gjør svaret mer empatisk ( Alt+Ctrl+E )" : "Gjør svaret mer empatisk"}`}>
        <Button
          data-color='neutral'
          variant='tertiary'
          size='small'
          aria-label='Gjør svaret mer empatisk'
          icon={<HandShakeHeartIcon fontSize='1.25rem' />}
          onClick={handleEmpathetic}
        />
      </Tooltip>
      <Tooltip
        content={`${isLastMessage ? "Gjør om svaret til du-form ( Alt+Ctrl+F )" : "Gjør om svaret til du-form"}`}
      >
        <Button
          data-color='neutral'
          variant='tertiary'
          size='small'
          aria-label='Gjør om svaret til du-form'
          icon={<PersonIcon fontSize='1.25rem' />}
          onClick={handleDuForm}
        />
      </Tooltip>
    </div>
  )
}

const MessageStar = ({ message }: { message: Message }) => {
  const [starred, setStarred] = useState(message.starred ?? false)
  const { starMessage, isMutating: isLoading } = useStarMessage(message.id)

  const handleStarMessage = () => {
    starMessage(!starred)
    setStarred(!starred)
  }

  return (
    <Tooltip content='Marker som bra svar'>
      <Button
        data-color='neutral'
        disabled={isLoading}
        variant='tertiary'
        size='small'
        aria-label='Marker som bra svar'
        icon={
          starred ? (
            <StarFillIcon
              fontSize='1.25rem'
              className='text-ax-warning-600'
            />
          ) : (
            <StarIcon fontSize='1.25rem' />
          )
        }
        onClick={() => {
          handleStarMessage()
        }}
      />
    </Tooltip>
  )
}

export default BobSuggests
