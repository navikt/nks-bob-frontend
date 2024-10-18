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

type FeedbackState = "positive" | "negative" | null

const toFeedbackState = (liked: boolean | null | undefined): FeedbackState => {
  if (liked === true) {
    return "positive"
  }
  if (liked === false) {
    return "negative"
  }
  return null
}

function FeedbackButtons({ message }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<FeedbackState>(
    toFeedbackState(message.feedback?.liked),
  )
  const { sendFeedback, isLoading } = useSendFeedback(message)

  async function handleFeedback(liked: boolean) {
    setFeedback(liked ? "positive" : "negative")
    const feedbackData: Feedback = { liked }
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
          className='hover:cursor-not-allowed'
        ></Button>
      )}
      {feedback === "negative" && (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbDownFilled />}
          disabled={true}
          className='hover:cursor-not-allowed'
        ></Button>
      )}
    </div>
  )
}

export default FeedbackButtons
