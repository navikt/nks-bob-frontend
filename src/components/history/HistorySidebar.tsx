import { BodyShort } from "@navikt/ds-react"
import { useConversations } from "../../api/api"
import {
  Before30DaysConversations,
  Last30DaysConversations,
  Last7DaysConversations,
  TodayConversations,
  YesterdayConversations,
} from "./historycategory/HistorySortedByCategory.tsx"

import "./HistorySidebar.css"

function HistorySidebar() {
  const { isLoading } = useConversations()

  return (
    <div className="h-full w-full max-w-60 overflow-scroll bg-bg-subtle p-3 max-md:hidden">
      {!isLoading ? (
        <div className="flex flex-col gap-4">
          <TodayConversations />
          <YesterdayConversations />
          <Last7DaysConversations />
          <Last30DaysConversations />
          <Before30DaysConversations />
        </div>
      ) : (
        <BodyShort className="pl-3">Du har ingen tidligere samtaler.</BodyShort>
      )}
    </div>
  )
}

export default HistorySidebar
