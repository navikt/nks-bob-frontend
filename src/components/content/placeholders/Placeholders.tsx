import { Alert as AlertComponent, Heading } from "@navikt/ds-react"
import Markdown from "react-markdown"
import { useAlerts } from "../../../api/api.ts"
import { ChristmasBobV1Dark, ChristmasBobV1Light } from "../../../assets/illustrations/ChristmasBob.tsx"
import { BobTheEasterRabbit } from "../../../assets/illustrations/BobTheEasterRabbit.tsx"
import prideBob from "../../../assets/illustrations/Pride-Bob.svg"
import {
  BobPlaceholder2026,
  BobPlaceHolderDark2026,
} from "../../../assets/illustrations/placeholders/BobPlaceHolder2026.tsx"
import { SadBob } from "../../../assets/illustrations/SadBob.tsx"
import bobSummerRobot from "../../../assets/illustrations/PNG/BobSummerRobot.png"
import { getCurrentSeason, type SeasonName } from "../../../utils/seasonUtils.ts"
import { Alert } from "../../../types/Notifications.ts"
import "./Placeholders.css"

type IllustrationPair = {
  Light: () => React.JSX.Element
  Dark: () => React.JSX.Element
}

const SummerBob = () => (
  <img
    src={bobSummerRobot}
    alt='Bob the summer robot'
    className='h-full w-full object-contain'
  />
)

const PrideBob = () => (
  <img
    src={prideBob}
    alt='Pride Bob'
    className='ml-[25%] h-full w-full object-contain'
  />
)

const SEASON_ILLUSTRATIONS: Record<SeasonName, IllustrationPair> = {
  christmas: {
    Light: ChristmasBobV1Light,
    Dark: ChristmasBobV1Dark,
  },
  easter: {
    Light: BobTheEasterRabbit,
    Dark: BobTheEasterRabbit,
  },
  pride: {
    Light: PrideBob,
    Dark: PrideBob,
  },
  summer: {
    Light: SummerBob,
    Dark: SummerBob,
  },
}

const DEFAULT_ILLUSTRATIONS: IllustrationPair = {
  Light: BobPlaceholder2026,
  Dark: BobPlaceHolderDark2026,
}

function getSeasonalIllustrations(): IllustrationPair {
  const season = getCurrentSeason()
  if (season === null) return DEFAULT_ILLUSTRATIONS
  return SEASON_ILLUSTRATIONS[season.name]
}

export const BobPlaceholder = () => {
  const { alerts } = useAlerts()
  const hasErrors = alerts.length > 0

  if (hasErrors) {
    return <BobError alerts={alerts} />
  }

  const { Light, Dark } = getSeasonalIllustrations()

  return (
    <>
      {/* Light mode */}
      <div className='my-14 flex w-full max-w-lg self-center dark:hidden'>
        <div className='mx-auto max-h-86 w-full px-14'>
          <Light />
        </div>
      </div>
      {/* Dark mode */}
      <div className='my-14 hidden w-full max-w-lg self-center dark:flex'>
        <div className='mx-auto max-h-86 w-full px-14'>
          <Dark />
        </div>
      </div>
    </>
  )
}

export const WhitespacePlaceholder = () => {
  return <div className='dialogcontent h-full items-center justify-center pt-8' />
}

const BobError = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length < 1) {
    return null
  }

  const { title, content, notificationType } = alerts.at(0)!
  const level = notificationType.toLowerCase() as "error" | "warning"

  return (
    <div className='bob-styling flex w-full max-w-2xl flex-row items-center gap-16'>
      <SadBob level={level} />
      <AlertComponent
        inline
        variant={level}
      >
        <Heading
          spacing
          size='small'
          level='3'
        >
          {title}
        </Heading>
        <Markdown>{content}</Markdown>
      </AlertComponent>
    </div>
  )
}
