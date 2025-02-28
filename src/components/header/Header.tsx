import { InformationSquareIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useState } from "react"
import amplitude from "../../utils/amplitude.ts"
import Guide from "../content/guide/Guide.tsx"
import { NewButton } from "../menu/NewButton.tsx"
import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"

interface HeaderProps {
  conversation: string | undefined
}

function Header({ conversation }: HeaderProps) {
  const [startGuide, setStartGuide] = useState(false)

  const showGuide = () => {
    amplitude.infoÅpnet()
    setStartGuide(true)
  }

  return (
    <div className='header'>
      <div className='flex max-w-24'>
        <NAVLogo />
      </div>
      <div className='max-h-30 flex h-full gap-3'>
        <div className='flex'>
          {conversation && <NewButton conversationId={conversation} />}
          <Tooltip content='Informasjon og tips'>
            <Button
              variant='tertiary'
              size='medium'
              onClick={showGuide}
              icon={<InformationSquareIcon aria-hidden />}
            />
          </Tooltip>
          <Guide startGuide={startGuide} setStartGuide={setStartGuide} />
        </div>
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
