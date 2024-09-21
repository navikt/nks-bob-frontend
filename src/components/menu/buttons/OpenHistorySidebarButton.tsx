import { ClockDashedIcon } from "@navikt/aksel-icons"
import { Button } from "@navikt/ds-react"

function OpenHistorySidebarButton() {
  return (
    <Button
      variant="tertiary"
      size="medium"
      icon={<ClockDashedIcon aria-hidden />}
      className="mr-2 md:hidden"
    />
  )
}

export default OpenHistorySidebarButton
