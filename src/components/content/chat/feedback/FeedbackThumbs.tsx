import { ThumbDownFillIcon, ThumbUpFillIcon } from "@navikt/aksel-icons"
import { BodyShort, Button } from "@navikt/ds-react"
import { useState } from "react"
import { useSendConversationFeedback } from "../../../../api/api.ts"
import { ConversationFeedback } from "../../../../types/Message.ts"

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
    const feedbackData: ConversationFeedback = { liked }
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
            icon={<ThumbUpFillIcon />}
            onClick={() => handleFeedback(true)}
            disabled={isLoading}
            title='Liker svaret'
          ></Button>
          <Button
            variant='tertiary-neutral'
            size='small'
            icon={<ThumbDownFillIcon className='scale-x-[-1]' />}
            onClick={() => handleFeedback(false)}
            disabled={isLoading}
            title='Liker ikke svaret'
          ></Button>
        </>
      )}
      {feedback === "positive" && (
        <BodyShort className='fade-in'> Takk for tilbakemeldingen!</BodyShort>
      )}
      {feedback === "negative" && (
        <BodyShort className='fade-in'> Takk for tilbakemeldingen!</BodyShort>
      )}
    </div>
  )
}

export default FeedbackThumbs
