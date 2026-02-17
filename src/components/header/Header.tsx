import { Link } from "react-router"
import { useUserConfig } from "../../api/api.ts"
import { CoachMark } from "../coachmark/CoachMark.tsx"
import { MainButtonsExplanation } from "../coachmark/CoachmarkContent.tsx"
import Guide from "../content/guide/Guide.tsx"
import { NewConceptMessage } from "../content/guide/GuideModals.tsx"
import { NewButton } from "../menu/NewButton.tsx"
import { ThemeButton } from "../menu/darkmode/DarkModeToggle.tsx"
import { NotificationToggle } from "../notification/NotificationDrawer.tsx"
import { NAVLogo } from "./nav-logo.tsx"
import RegretNewButton from "./regretbutton/RegretNewConversationButton.tsx"

interface HeaderProps {
  conversation: string | undefined
}

function Header({ conversation }: HeaderProps) {
  const { userConfig } = useUserConfig()
  const coachMarkKey = "coachMarkShownHeader"

  return (
    <div
      className='tallWide:sticky tallWide:top-0 tallWide:left-0 tallWide:right-0 tallWide:z-50 bg-ax-bg-default mb-1 w-full'
      style={{ viewTransitionName: "nav-header" }}
    >
      <div className='marginWide:px-16 mx-auto flex max-h-16 w-full max-w-screen-2xl items-center justify-between self-center px-4 py-4'>
        <div className='ml-2 flex max-w-24'>
          <Link
            to='https://www.nav.no/'
            target='_blank'
            tabIndex={-1}
          >
            <NAVLogo />
          </Link>
        </div>
        <div className='flex h-full max-h-30 gap-3'>
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
            <RegretNewButton />
            <NotificationToggle />
            <Guide />
            {userConfig?.showNewConceptInfo && <NewConceptMessage />}
            <ThemeButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
