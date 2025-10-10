import { ChevronLeftDoubleIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"
import { useLocation, useNavigate } from "react-router"

const RegretNewButton = () => {
  const location = useLocation()
  const fromConversationId = location.state?.from
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/samtaler/${fromConversationId}`, { replace: false })
  }

  return (
    <>
      {fromConversationId ? (
        <div>
          <Button
            className='fade-in mb-2'
            variant='tertiary-neutral'
            size='small'
            icon={<ChevronLeftDoubleIcon />}
            onClick={handleClick}
          >
            Angre ny samtale
          </Button>
        </div>
      ) : null}
    </>
  )
}

export default RegretNewButton
