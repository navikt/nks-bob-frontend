import { Alert, BodyShort, Heading } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { useErrorNotifications } from "../../../api/api.ts"
import {
  BobTheRobot,
  BobTheRobotDark,
} from "../../../assets/illustrations/BobTheRobot.tsx"
import { SadBob } from "../../../assets/illustrations/SadBob.tsx"
import { ErrorNotification } from "../../../types/Notifications.ts"
import "./Placeholders.css"

export const BobPlaceholder = () => {
  const { errorNotifications } = useErrorNotifications()
  const hasErrors = errorNotifications.length > 0

  return (
    <>
      {!hasErrors && (
        <>
          <div className='bob-styling flex dark:hidden'>
            <div>
              <BobTheRobot />
            </div>
            <BodyShort size='medium' className='self-center text-text-subtle'>
              Hei! Hva kan jeg hjelpe deg med?
            </BodyShort>
          </div>
          <div className='bob-styling hidden dark:flex'>
            <div>
              <BobTheRobotDark />
            </div>
            <BodyShort size='medium' className='self-center text-text-subtle'>
              Hei! Hva kan jeg hjelpe deg med?
            </BodyShort>
          </div>
        </>
      )}
      {hasErrors && <BobError errorNotifications={errorNotifications} />}
    </>
  )
}

export const WhitespacePlaceholder = () => {
  return (
    <div className='dialogcontent h-full items-center justify-center pt-8' />
  )
}

const BobError = ({
  errorNotifications,
}: {
  errorNotifications: ErrorNotification[]
}) => {
  if (errorNotifications.length < 1) {
    return null
  }

  const { title, content, notificationType } = errorNotifications.at(0)!
  const level = notificationType.toLowerCase() as "error" | "warning"

  return (
    <div className='bob-styling flex w-full max-w-2xl flex-row items-center gap-16'>
      <SadBob level={level} />
      <Alert inline variant={level}>
        <Heading spacing size='small' level='3'>
          {title}
        </Heading>
        <Markdown>{content}</Markdown>
      </Alert>
    </div>
  )
}
