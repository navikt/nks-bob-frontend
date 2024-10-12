import { InternalHeader, Spacer } from "@navikt/ds-react"
import { Link } from "react-router-dom"

function Header() {
  return (
    <InternalHeader className='sticky left-0 right-0 top-0 z-10 flex min-h-16'>
      <Link to='/' className='flex'>
        <InternalHeader.Title as='h1'>NKS-Bob</InternalHeader.Title>
      </Link>
      <Spacer />
      <InternalHeader.User name='Brukernavn' />
    </InternalHeader>
  )
}

export default Header
