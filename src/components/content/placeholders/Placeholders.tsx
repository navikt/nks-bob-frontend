import { BodyShort } from "@navikt/ds-react"
import {
  BobTheChristmasWizardDefault,
  BobTheDarkChristmasWizard,
} from "../../../assets/illustrations/BobTheChristmasWizard.tsx"
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

export const BobChristmasPlaceholder = () => {
  return (
    <>
      <div className='bob-styling flex gap-8 dark:hidden'>
        <div className='flex max-h-fit max-w-full'>
          <BobTheChristmasWizardDefault />
        </div>
        <BodyShort size='medium' align='center'>
          God jul fra Bob og alle i teamet!
        </BodyShort>
      </div>
      <div className='bob-styling hidden gap-8 dark:flex'>
        <div className='flex max-h-fit max-w-full'>
          <BobTheDarkChristmasWizard />
        </div>
        <BodyShort size='medium' align='center'>
          God jul fra Bob og alle i teamet!
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
