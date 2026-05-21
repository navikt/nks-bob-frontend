import { CheckmarkCircleIcon } from "@navikt/aksel-icons"
import { BodyShort } from "@navikt/ds-react"
import styles from "./FeedbackSuccess.module.css"

interface FeedbackSuccessProps {
  onDone: () => void
}

export const FeedbackSuccess = ({ onDone }: FeedbackSuccessProps) => (
  <div
    className={styles.overlay}
    onAnimationEnd={onDone}
  >
    <div className='flex flex-col items-center gap-2'>
      <CheckmarkCircleIcon
        fontSize='2.5rem'
        color='var(--a-green-500)'
      />
      <BodyShort
        weight='semibold'
        size='medium'
      >
        Takk for din tilbakemelding!
      </BodyShort>
    </div>
  </div>
)
