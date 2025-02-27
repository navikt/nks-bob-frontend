import { Select } from "@navikt/ds-react"

export const StepSelect = ({
  step,
  onChange,
}: {
  step: number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => {
  return (
    <Select
      label='Velg steg'
      hideLabel
      size='small'
      onChange={onChange}
      value={step}
      className='h-fit self-center'
    >
      <option value='1'>1/4: Om tjenesten</option>
      <option value='2'>2/4: Når du stiller spørsmål </option>
      <option value='3'>3/4: Om svaret fra Bob </option>
      <option value='4'>4/4: Misfornøyd med svaret? </option>
    </Select>
  )
}
