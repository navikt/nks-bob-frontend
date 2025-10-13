import { ArrowCirclepathReverseIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"

const RegretNewButton = () => {
  const location = useLocation()
  const fromConversationId = location.state?.from
  const navigate = useNavigate()
  const [showText, setShowText] = useState(true)

  useEffect(() => {
    if (fromConversationId) {
      const timer = setTimeout(() => setShowText(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [fromConversationId])

  const handleClick = () => {
    navigate(`/samtaler/${fromConversationId}`, { replace: false })
  }

  return (
    <>
      {fromConversationId ? (
        <Tooltip content='Angre ny samtale'>
          <Button
            className='fade-in mr-2'
            variant='danger'
            size='small'
            icon={<ArrowCirclepathReverseIcon />}
            onClick={handleClick}
          >
            {showText && "Angre ny samtale"}
          </Button>
        </Tooltip>
      ) : null}
    </>
  )
}

export default RegretNewButton
