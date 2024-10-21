import {
  BobTheWizardDark,
  BobTheWizardDefault,
} from "../../../assets/illustrations/BobTheWizard.tsx"

export const BobPlaceholder = () => {
  return (
    <>
      <div className='flex h-full w-full max-w-sm self-center dark:hidden'>
        <BobTheWizardDefault />
      </div>
      <div className='hidden h-full w-full max-w-sm self-center dark:flex'>
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
