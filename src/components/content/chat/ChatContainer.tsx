import React, { Fragment, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Message, NewMessage } from "../../../types/Message.ts"
import { BobAnswerBubble } from "./chatbubbles/answerbubble/BobAnswerBubble.tsx"
import UserQuestionBubble from "./chatbubbles/UserQuestionBubble.tsx"

interface ChatDialogProps {
  messages: Message[]
  onSend: (message: NewMessage) => void
  isLoading: boolean
}

function ChatContainer({ messages, onSend, isLoading }: ChatDialogProps) {
  const lastMessageRef = useRef<HTMLDivElement | null>(null)
  const selectedMessageRef = useRef<HTMLDivElement | null>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const prevMessagesLength = useRef<number>(messages.length)

  // update selected message
  useEffect(() => {
    if (searchParams.has("messageId")) {
      const messageId = searchParams.get("messageId")!
      setSelectedMessageId(messageId)
    }
  }, [searchParams, setSelectedMessageId])

  // scroll on param
  useEffect(() => {
    if (selectedMessageRef.current) {
      selectedMessageRef.current.scrollIntoView({
        behavior: "instant",
      })
    }
  }, [messages, selectedMessageRef, selectedMessageId])

  // scroll on new message
  useEffect(() => {
    if (lastMessageRef.current && !selectedMessageRef.current && messages.length > prevMessagesLength.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
    prevMessagesLength.current = messages.length
  }, [messages, lastMessageRef, selectedMessageRef])

  const handleCopy: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const sel = window.getSelection()?.toString()
    if (!sel) return
    e.preventDefault()
    e.clipboardData.setData("text/plain", sel.trimEnd())
  }

  return (
    <div
      className='dialogcontent h-auto grow flex-col px-4 pt-4'
      onCopy={handleCopy}
    >
      {messages.map((message, index) =>
        message.messageRole === "human" ? (
          <Fragment key={message.id}>
            <div ref={lastMessageRef} />
            <UserQuestionBubble userQuestion={message} />
          </Fragment>
        ) : (
          <Fragment key={message.id}>
            {message.id === selectedMessageId && <div ref={selectedMessageRef} />}
            <BobAnswerBubble
              key={message.id}
              message={message}
              onSend={onSend}
              isLoading={isLoading}
              isLastMessage={index === messages.length - 1}
              isHighlighted={message.id === selectedMessageId}
              followUp={message.followUp ?? []}
            />
          </Fragment>
        ),
      )}
    </div>
  )
}

export default ChatContainer
