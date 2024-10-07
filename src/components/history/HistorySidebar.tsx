import { BodyShort, Heading } from "@navikt/ds-react"
import { useConversations } from "../../api/api"
import {
  Before30DaysConversations,
  Last30DaysConversations,
  Last7DaysConversations,
  TodayConversations,
  YesterdayConversations,
} from "./historycategory/HistorySortedByCategory.tsx"

import { ClockDashedIcon } from "@navikt/aksel-icons"
import "./HistorySidebar.css"

function HistorySidebar() {
  const { isLoading } = useConversations()

  return (
    <div className='layout h-full px-3 max-md:hidden'>
      <div className='mb-2 flex w-full justify-between px-2'>
        <Heading size='xsmall'>Dine samtaler</Heading>
        <ClockDashedIcon title='Dine samtaler' fontSize='1.5rem' />
      </div>
      {!isLoading ? (
        <div className='flex w-full flex-col-reverse gap-6'>
          <TodayConversations />
          <YesterdayConversations />
          <Last7DaysConversations />
          <Last30DaysConversations />
          <Before30DaysConversations />
        </div>
      ) : (
        <BodyShort className='px-2'>Du har ingen tidligere samtaler.</BodyShort>
      )}
    </div>
  )
}

export default HistorySidebar
