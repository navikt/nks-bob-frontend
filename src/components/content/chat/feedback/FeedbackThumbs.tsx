import {
  ThumbDownFillIcon,
  ThumbDownIcon,
  ThumbUpFillIcon,
  ThumbUpIcon,
} from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { useState } from "react"
import { useSendConversationFeedback } from "../../../../api/api.ts"
import { Feedback } from "../../../../types/Message.ts"

interface FeedbackButtonsProps {
  conversationId: string
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

function FeedbackThumbs({ conversationId }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<FeedbackState>(toFeedbackState(null))
  const { sendFeedback, isLoading } =
    useSendConversationFeedback(conversationId)

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
    <div className='flex justify-start'>
      {feedback === null && (
        <>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<ThumbUpIcon />}
            onClick={() => handleFeedback(true)}
            disabled={isLoading}
            title='Liker svaret'
          ></Button>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<ThumbDownIcon className='scale-x-[-1]' />}
            onClick={() => handleFeedback(false)}
            disabled={isLoading}
            title='Liker ikke svaret'
          ></Button>
        </>
      )}
      {feedback === "positive" && (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbUpFillIcon />}
          disabled={true}
          className='hover:cursor-not-allowed'
        ></Button>
      )}
      {feedback === "negative" && (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbDownFillIcon className='scale-x-[-1]' />}
          disabled={true}
          className='hover:cursor-not-allowed'
        ></Button>
      )}
    </div>
  )
}

export default FeedbackThumbs
