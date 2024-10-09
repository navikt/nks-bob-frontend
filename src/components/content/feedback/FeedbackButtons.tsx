import { Button } from "@navikt/ds-react"
import { useState } from "react"
import { useSendFeedback } from "../../../api/api.ts"
import {
  ThumbDownFilled,
  ThumbDownOutline,
  ThumbUpFilled,
  ThumbUpOutline,
} from "../../../assets/icons/Thumbs"
import { Feedback, Message } from "../../../types/Message.ts"

interface FeedbackButtonsProps {
  message: Message
}

function FeedbackButtons({ message }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const { sendFeedback, isLoading } = useSendFeedback(message)

  async function handleFeedback(liked: boolean) {
    setFeedback(liked ? "positive" : "negative")
    const feedbackData: Feedback = {
      id: message.feedback.id,
      liked,
      createdAt: new Date().toISOString(),
    }
    try {
      await sendFeedback(feedbackData)
    } catch (error) {
      console.error("Failed to send feedback", error)
    }
  }

  return (
    <div className='flex justify-end'>
      {feedback === null && (
        <>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<ThumbUpOutline />}
            onClick={() => handleFeedback(true)}
            disabled={isLoading}
          ></Button>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<ThumbDownOutline />}
            onClick={() => handleFeedback(false)}
            disabled={isLoading}
          ></Button>
        </>
      )}
      {feedback === "positive" && (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbUpFilled />}
          disabled={true}
        ></Button>
      )}
      {feedback === "negative" && (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbDownFilled />}
          disabled={true}
        ></Button>
      )}
    </div>
  )
}

export default FeedbackButtons
