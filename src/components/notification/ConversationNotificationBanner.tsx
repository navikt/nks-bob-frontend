import { Box, Button, HStack, Link, LocalAlert } from "@navikt/ds-react"
import { Link as RouterLink } from "react-router"
import { useConversationNotifications } from "./ConversationNotificationsProvider"

export function ConversationNotificationBanner() {
  const { snapshot, dismiss, retry } = useConversationNotifications()
  const { latest, status } = snapshot
  const unavailable = ["disconnected", "login-required", "blocked"].includes(status)
  return (
    <Box
      paddingInline='space-16'
      className='conversation-notification-banner'
    >
      <div
        role='status'
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
      >
        {latest &&
          `En ny samtale er opprettet. Varsel mottatt ${new Date(latest.receivedAt).toLocaleTimeString("nb-NO")}. Åpne den via samtalevarsler.`}
        {unavailable && "Varsling om nye samtaler er frakoblet."}
      </div>
      {latest && (
        <LocalAlert
          status='announcement'
          role={undefined}
          size='small'
          aria-label='Ny samtale'
        >
          <LocalAlert.Header>
            <LocalAlert.Title as='div'>En ny samtale er opprettet</LocalAlert.Title>
            <LocalAlert.CloseButton
              aria-label='Lukk samtalebeskjeden'
              onClick={dismiss}
            />
          </LocalAlert.Header>
          <LocalAlert.Content>
            <Link
              as={RouterLink}
              to={`/samtaler/${latest.conversationId}`}
            >
              Åpne samtalen
            </Link>
          </LocalAlert.Content>
        </LocalAlert>
      )}
      {unavailable && (
        <LocalAlert
          status='warning'
          role={undefined}
          size='small'
          aria-label='Varsling er frakoblet'
        >
          <LocalAlert.Header>
            <LocalAlert.Title as='div'>Varsling om nye samtaler er frakoblet</LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            {status === "login-required" ? (
              <>
                Innloggingen har utløpt. Ta vare på arbeidet ditt før du{" "}
                <Link href={`/login?referer=${encodeURIComponent(window.location.href)}`}>logger inn på nytt</Link>.
              </>
            ) : (
              <HStack
                gap='space-8'
                align='center'
              >
                <span>Vanlig chat kan fortsatt brukes. Varsler fra avbruddet blir ikke levert på nytt.</span>
                <Button
                  variant='tertiary'
                  size='small'
                  onClick={retry}
                >
                  Kontroller tilkoblingen
                </Button>
              </HStack>
            )}
          </LocalAlert.Content>
        </LocalAlert>
      )}
    </Box>
  )
}
