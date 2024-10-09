import { Button } from "@navikt/ds-react"
import { useState } from "react"
import {
  ThumbDownOutline,
  ThumbUpOutline,
} from "../../../assets/icons/Thumbs.tsx"

function FeedbackButtons() {
  const [showThumbsUp, setShowThumbsUp] = useState(true)

  return (
    <div className='flex justify-end'>
      {showThumbsUp ? (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbUpOutline />}
          onClick={() => setShowThumbsUp(false)}
        ></Button>
      ) : (
        <Button
          variant='tertiary-neutral'
          size='small'
          icon={<ThumbDownOutline />}
          onClick={() => setShowThumbsUp(true)}
        ></Button>
      )}
    </div>
  )
}

export default FeedbackButtons
