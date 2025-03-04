import { BodyShort } from "@navikt/ds-react"
import {
  BobTheRobot,
  BobTheRobotDark,
} from "../../../assets/illustrations/BobTheRobot.tsx"
import "./Placeholders.css"

export const BobPlaceholder = () => {
  return (
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
  )
}

export const WhitespacePlaceholder = () => {
  return (
    <div className='dialogcontent h-full items-center justify-center pt-8' />
  )
}
