import { ClockDashedIcon, NotePencilIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { Link } from "react-router-dom"

export const HistorikkButton = () => {
  return (
    <>
      <Button
        variant='tertiary'
        size='medium'
        icon={<ClockDashedIcon aria-hidden />}
        className='mr-2 md:hidden'
      ></Button>
    </>
  )
}

export const NewButton = () => {
  return (
    <>
      <Link to='/'>
        <Button
          variant='tertiary'
          size='medium'
          icon={<NotePencilIcon aria-hidden />}
          className='md:hidden'
        ></Button>
      </Link>
      <Link to='/'>
        <Button
          variant='tertiary'
          size='medium'
          icon={<NotePencilIcon aria-hidden />}
          iconPosition='right'
          className='max-md:hidden'
        >
          Ny samtale
        </Button>
      </Link>
    </>
  )
}
