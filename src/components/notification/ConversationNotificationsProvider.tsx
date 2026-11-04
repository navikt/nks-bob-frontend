import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { Box } from "@navikt/ds-react"
import { useMatch } from "react-router"
import { useSWRConfig } from "swr"
import { log } from "../../api/api"
import { createConversationListRefresher } from "../../api/conversationListRefresh"
import { ConversationNotifications, NotificationSnapshot } from "../../api/conversationNotifications"
import { fetchNotificationSession } from "../../api/session"
import { buildWebSocketUrl } from "../../api/websocketUrl"
import { ConversationNotificationBanner } from "./ConversationNotificationBanner"

const emptySnapshot: NotificationSnapshot = {
  status: "disabled",
  notices: [],
  latest: null,
  truncated: false,
}
const NotificationsContext = createContext<{
  snapshot: NotificationSnapshot
  dismiss: () => void
  retry: () => void
}>({ snapshot: emptySnapshot, dismiss: () => {}, retry: () => {} })

export const useConversationNotifications = () => useContext(NotificationsContext)

export function ConversationNotificationsProvider({ children }: PropsWithChildren) {
  const { mutate } = useSWRConfig()
  const controller = useMemo(
    () =>
      new ConversationNotifications({
        session: fetchNotificationSession,
        socket: () => new WebSocket(buildWebSocketUrl("/api/v2/conversations/notifications/ws")),
        refreshHistory: createConversationListRefresher(mutate),
        online: () => navigator.onLine,
        report: (category) => {
          void log("warn", `conversation-notifications:${category}`).catch(() => {
            console.warn("Unable to report conversation notification diagnostic")
          })
        },
      }),
    [mutate],
  )
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  const conversationId = useMatch("/samtaler/:conversationId")?.params.conversationId

  useEffect(() => {
    if (conversationId) controller.removeNotice(conversationId.toLowerCase())
  }, [controller, conversationId, snapshot.notices])

  useEffect(() => {
    controller.start()
    const check = () => {
      void controller.checkSession()
    }
    const visible = () => {
      if (document.visibilityState === "visible") check()
    }
    window.addEventListener("focus", check)
    window.addEventListener("online", check)
    window.addEventListener("offline", check)
    window.addEventListener("pagehide", controller.stop)
    window.addEventListener("pageshow", controller.start)
    window.addEventListener("bob-session-ended", controller.stop)
    document.addEventListener("visibilitychange", visible)
    return () => {
      window.removeEventListener("focus", check)
      window.removeEventListener("online", check)
      window.removeEventListener("offline", check)
      window.removeEventListener("pagehide", controller.stop)
      window.removeEventListener("pageshow", controller.start)
      window.removeEventListener("bob-session-ended", controller.stop)
      document.removeEventListener("visibilitychange", visible)
      controller.stop()
    }
  }, [controller])

  const value = useMemo(
    () => ({
      snapshot,
      dismiss: controller.dismiss,
      retry: () => {
        void controller.checkSession()
      },
    }),
    [snapshot, controller],
  )
  return (
    <NotificationsContext.Provider value={value}>
      <ConversationNotificationBanner />
      <Box className='conversation-notification-content'>{children}</Box>
    </NotificationsContext.Provider>
  )
}
