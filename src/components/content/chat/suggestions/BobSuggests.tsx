import {
  BulletListIcon,
  HandHeartIcon,
  LanguageIcon,
  StarFillIcon,
  StarIcon,
} from "@navikt/aksel-icons"
import { Button, CopyButton, Tag, Tooltip } from "@navikt/ds-react"
import { useState } from "react"
import { useStarMessage } from "../../../../api/api.ts"
import { Message, NewMessage } from "../../../../types/Message.ts"
import analytics from "../../../../utils/analytics.ts"
import { md } from "../../../../utils/markdown.ts"
import { CoachMark } from "../../../coachmark/CoachMark.tsx"
import { AnswerButtonsExplanation } from "../../../coachmark/CoachmarkContent.tsx"
import { FeedbackOnAnswer } from "../feedback/GiveUsFeedback.tsx"
import "./BobSuggests.css"

interface BobSuggestsProps {
  message: Message
  onSend: (message: NewMessage) => void
  isLastMessage: boolean
}

const BobSuggests = ({ message, onSend, isLastMessage }: BobSuggestsProps) => {
  const coachMarkKey = "coachMarkShownChat"

  function handleTranslate() {
    analytics.svarEndret("oversett")
    const translate: NewMessage = {
      content: isLastMessage
        ? "Oversett svaret til engelsk"
        : `Oversett til engelsk:\n${message.content}`,
    }
    onSend(translate)
  }

  function handleBulletList() {
    analytics.svarEndret("punktliste")
    const bulletList: NewMessage = {
      content: isLastMessage
        ? "Gjør om svaret til punktliste"
        : `Gjør om til punktliste:\n${message.content}`,
    }
    onSend(bulletList)
  }

  function handleEmpathetic() {
    analytics.svarEndret("forenkle")
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
    <div className='fade-in background-color ml-[-0.3rem] flex h-fit w-fit flex-wrap items-center justify-start rounded mb-4'>
      <Tooltip content='Kopier svaret'>
        <CopyButton
          copyText=''
          size='small'
          aria-label='Kopier svaret'
          onClick={() => {
            new Promise((resolve) => setTimeout(resolve, 100)).then(() =>
              copyMessageContent(),
            )

            analytics.svarKopiert(message.id)
          }}
        />
      </Tooltip>
      {/*<GiveUsFeedback message={message} />*/}
      <FeedbackOnAnswer message={message} />

      <MessageStar message={message} />
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
      <div className='mx-2 flex'>
        <CoachMark
          title='Disse knappene lar deg:'
          buttonText='Skjønner!'
          coachMarkKey={coachMarkKey}
        >
          <AnswerButtonsExplanation />
        </CoachMark>
      </div>
      {!message.pending && message.context.length === 0 && (
        <Tag size='small' variant='neutral' className='mt-1 h-fit'>
          Bob brukte ingen kilder for å lage svaret
        </Tag>
      )}
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
        disabled={isLoading}
        variant='tertiary-neutral'
        size='small'
        aria-label='Marker som bra svar'
        icon={
          starred ? <StarFillIcon className='text-orange-500' /> : <StarIcon />
        }
        onClick={() => {
          handleStarMessage()
        }}
      />
    </Tooltip>
  )
}

export default BobSuggests
