import { InformationSquareIcon } from "@navikt/aksel-icons"
import { Button, Tooltip } from "@navikt/ds-react"
import { useState } from "react"
import { useUserConfig } from "../../api/api.ts"
import amplitude from "../../utils/amplitude.ts"
import { CoachMark } from "../coachmark/CoachMark.tsx"
import { MainButtonsExplanation } from "../coachmark/CoachmarkContent.tsx"
import Guide from "../content/guide/Guide.tsx"
import { NewConceptMessage } from "../content/guide/GuideModals.tsx"
import { NewButton } from "../menu/NewButton.tsx"
import DarkModeToggle from "../menu/darkmode/DarkModeToggle.tsx"
import { NotificationToggle } from "../notification/NotificationDrawer.tsx"
import "./Header.css"
import { NAVLogo } from "./nav-logo.tsx"

interface HeaderProps {
  conversation: string | undefined
}

function Header({ conversation }: HeaderProps) {
  const [startGuide, setStartGuide] = useState(false)
  const { userConfig } = useUserConfig()
  const coachMarkKey = "coachMarkShownHeader"

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
        <div className='flex items-center justify-center align-middle'>
          {conversation && (
            <>
              <CoachMark
                title='Her finner du overordnede valg'
                buttonText='Den er grei!'
                coachMarkKey={coachMarkKey}
              >
                <MainButtonsExplanation />
              </CoachMark>
              <NewButton conversationId={conversation} />
            </>
          )}
          <NotificationToggle />
          <Tooltip content='Informasjon og tips'>
            <Button
              variant='tertiary'
              size='medium'
              onClick={showGuide}
              icon={<InformationSquareIcon aria-hidden />}
            />
          </Tooltip>
          <Guide startGuide={startGuide} setStartGuide={setStartGuide} />
          {userConfig?.showNewConceptInfo && <NewConceptMessage />}
        </div>
        <DarkModeToggle />
      </div>
    </div>
  )
}

export default Header
