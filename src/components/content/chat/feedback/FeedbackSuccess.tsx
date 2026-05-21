import { CheckmarkCircleIcon } from "@navikt/aksel-icons"
import styles from "./FeedbackSuccess.module.css"

interface FeedbackSuccessProps {
  onDone: () => void
}

export const FeedbackSuccess = ({ onDone }: FeedbackSuccessProps) => (
  <div
    className={styles.overlay}
    onAnimationEnd={onDone}
  >
    <div className={styles.content}>
      <CheckmarkCircleIcon
        fontSize='2.5rem'
        color='var(--a-green-500)'
      />
      Takk for din tilbakemelding!
    </div>
  </div>
)
