import { Alert as AlertComponent, BodyShort, Heading } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { useAlerts } from "../../../api/api.ts"
// import {
//   BobTheRobot,
//   BobTheRobotDark,
// } from "../../../assets/illustrations/BobTheRobot.tsx"
import { SadBob } from "../../../assets/illustrations/SadBob.tsx"
import { Alert } from "../../../types/Notifications.ts"
import "./Placeholders.css"
import BobSummerRobot from '../../../assets/illustrations/PNG/BobSummerRobot.png'

export const BobPlaceholder = () => {
  const { alerts } = useAlerts()
  const hasErrors = alerts.length > 0

  return (
    <>
      {!hasErrors && (
        <>
          <div className='bob-styling flex dark:hidden'>
            <div className="h-[450px] w-[450px] flex self-center mb-4">
              <img src={BobSummerRobot} alt="Sommer-Bob" className="h-full w-full"/>
            </div>
            {/*<div>*/}
            {/*  <BobTheRobot />*/}
            {/*</div>*/}
            <BodyShort size='medium' className='self-center text-text-subtle'>
              Hei! Hva kan jeg hjelpe deg med?
            </BodyShort>
          </div>
          <div className='bob-styling hidden dark:flex'>
            {/*<div>*/}
            {/*  <BobTheRobotDark />*/}
            {/*</div>*/}
            <div className="h-[450px] w-[450px] flex self-center mb-4">
              <img src={BobSummerRobot} alt="Sommer-Bob" className="h-full w-full"/>
            </div>
            <BodyShort size='medium' className='self-center text-text-subtle'>
              Hei! Hva kan jeg hjelpe deg med?
            </BodyShort>
          </div>
        </>
      )}
      {hasErrors && <BobError alerts={alerts} />}
    </>
  )
}

export const WhitespacePlaceholder = () => {
  return (
    <div className='dialogcontent h-full items-center justify-center pt-8' />
  )
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
      <AlertComponent inline variant={level}>
        <Heading spacing size='small' level='3'>
          {title}
        </Heading>
        <Markdown>{content}</Markdown>
      </AlertComponent>
    </div>
  )
}
