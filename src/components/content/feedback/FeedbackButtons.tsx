import { Button } from "@navikt/ds-react"
import {
  ThumbDownOutline,
  ThumbUpOutline,
} from "../../../assets/Icons/Thumbs.tsx"

function FeedbackButtons() {
  return (
    <div className='flex'>
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
