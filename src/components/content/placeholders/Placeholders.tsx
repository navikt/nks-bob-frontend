import {
  BobTheWizardDark,
  BobTheWizardDefault,
} from "../../../assets/illustrations/BobTheWizard.tsx"
import "./Placeholders.css"

export const BobPlaceholder = () => {
  return (
    <>
      <div className='bob-styling flex dark:hidden'>
        <BobTheWizardDefault />
      </div>
      <div className='bob-styling hidden dark:flex'>
        <BobTheWizardDark />
      </div>
    </>
  )
}

export const WhitespacePlaceholder = () => {
  return (
    <div className='dialogcontent h-full items-center justify-center pt-8' />
  )
}
