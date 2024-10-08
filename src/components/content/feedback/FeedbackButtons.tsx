import { Button } from "@navikt/ds-react"
import {
  ThumbDownOutline,
  ThumbUpOutline,
} from "../../../assets/icons/Thumbs.tsx"

function FeedbackButtons() {
  return (
    <div className='flex justify-end'>
      <Button
        variant='tertiary-neutral'
        size='small'
        icon={<ThumbUpOutline />}
      ></Button>
      <Button
        variant='tertiary-neutral'
        size='small'
        icon={<ThumbDownOutline />}
      ></Button>
    </div>
  )
}

export default FeedbackButtons
