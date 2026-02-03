import { Alert as AlertComponent, BodyShort, Heading } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { useAlerts } from "../../../api/api.ts"
import { BobTheRobot, BobTheRobotDark } from "../../../assets/illustrations/BobTheRobot.tsx"
import { SadBob } from "../../../assets/illustrations/SadBob.tsx"
import { Alert } from "../../../types/Notifications.ts"
import "./Placeholders.css"

export const BobPlaceholder = () => {
  const { alerts } = useAlerts()
  const hasErrors = alerts.length > 0

  const displayText = "Hei! Hva kan jeg hjelpe deg med?"

  return (
    <>
      {!hasErrors && (
        <>
          <div className='bob-styling flex dark:hidden'>
            <div>
              <BobTheRobot />
            </div>
            <BodyShort
              size='medium'
              className='self-center text-ax-text-neutral-subtle'
            >
              {displayText}
            </BodyShort>
          </div>
          <div className='bob-styling hidden dark:flex'>
            <div>
              <BobTheRobotDark />
            </div>
            <BodyShort
              size='medium'
              className='self-center text-ax-text-neutral-subtle'
            >
              {displayText}
            </BodyShort>
          </div>
        </>
      )}
      {hasErrors && <BobError alerts={alerts} />}
    </>
  )
}

export const WhitespacePlaceholder = () => {
  return <div className='dialogcontent h-full items-center justify-center pt-8' />
}

const BobError = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length < 1) {
    return null
  }

  const { title, content, notificationType } = alerts.at(0)!
  const level = notificationType.toLowerCase() as "error" | "warning"

  return (
    <div className='bob-styling flex w-full max-w-2xl flex-row items-center gap-16'>
      <SadBob level={level} />
      <AlertComponent
        inline
        variant={level}
      >
        <Heading
          spacing
          size='small'
          level='3'
        >
          {title}
        </Heading>
        <Markdown>{content}</Markdown>
      </AlertComponent>
    </div>
  )
}
