import { Fragment, useEffect, useRef } from "react"
import { Message, NewMessage } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/answerbubble/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"
import { useErrorNotifications } from "../../../api/api.ts"
import { ErrorNotification } from "../../../types/Notifications.ts"
import { Alert, Heading } from "@navikt/ds-react"
import Markdown from "react-markdown"

interface ChatDialogProps {
  messages: Message[]
  onSend: (message: NewMessage) => void
  isLoading: boolean
}

function ChatContainer({ messages, onSend, isLoading }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)
  const { errorNotifications } = useErrorNotifications()

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "instant",
      })
    }
  }, [messages])

  return (
    <div className='dialogcontent h-auto grow flex-col px-4 pt-4'>
      <ErrorBanner errorNotifications={errorNotifications} />
      {messages.map((message, index) =>
        message.messageRole === "human" ? (
          <Fragment key={message.id}>
            <div ref={lastMessageRef} />
            <UserQuestionBubble userQuestion={message} />
          </Fragment>
        ) : (
          <BobAnswerBubble
            key={message.id}
            message={message}
            onSend={onSend}
            isLoading={isLoading}
            isLastMessage={index === messages.length - 1}
          />
        ),
      )}
    </div>
  )
}

const ErrorBanner = ({
  errorNotifications,
}: {
  errorNotifications: ErrorNotification[]
}) => {
  const { title, content, notificationType } = errorNotifications.at(0)!
  const level = notificationType.toLowerCase() as "error" | "warning"

  return (
    <Alert fullWidth variant={level} className="mb-4">
      <Heading spacing size='small' level='3'>
        {title}
      </Heading>
      <Markdown>{content}</Markdown>
    </Alert>
  )
}

export default ChatContainer
