import { BellIcon } from "@navikt/aksel-icons"
import { BodyLong, BodyShort, Button, Detail, Dropdown, Heading, Tabs, Tooltip } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import Markdown from "react-markdown"
import { useNewsNotifications } from "../../api/api"
import { NewsNotification } from "../../types/Notifications"
import { useUpdateLocalStorage } from "../../utils/localStorage"
import "./NotificationDrawer.css"

const useReadNotifications = () => {
  const [_, setRead, getRead] = useUpdateLocalStorage("readNotifications")

  const setReadNotifications = (notificationIds: string[]) => {
    setRead(notificationIds)
  }

  const readNotifications = (getRead() as string[] | undefined) ?? []

  const isUnread = (notificationId: string) => !readNotifications.includes(notificationId)

  const hasUnreadNotifications = (notificationIds: string[]) => notificationIds.some(isUnread)

  return {
    readNotifications,
    setReadNotifications,
    hasUnreadNotifications,
    isUnread,
  }
}

type TabName = "alle" | "nye"

const defaultTabName: TabName = "alle"

export const NotificationToggle = () => {
  const { newsNotifications } = useNewsNotifications()
  const { setReadNotifications, hasUnreadNotifications } = useReadNotifications()
  const [activeTab, setActiveTab] = useState<TabName>(defaultTabName)
  const notificationIds = newsNotifications.map(({ id }) => id)

  const [initialOpen, setInitialOpen] = useState<boolean | null>(null)
  const hasUnread = hasUnreadNotifications(notificationIds)

  useEffect(() => {
    if (hasUnread) {
      setInitialOpen(true)
      setActiveTab("nye")
    }

    if (!hasUnread) {
      setActiveTab("alle")
    }
  }, [initialOpen, setInitialOpen, hasUnread])

  useHotkeys("Alt+Ctrl+V", () => setInitialOpen((prev) => !prev))

  return (
    <Dropdown
      open={initialOpen ?? false}
      onOpenChange={(open) => {
        if (!open && activeTab === "nye") {
          setReadNotifications(notificationIds)
        }
        setInitialOpen(open)
      }}
    >
      <Tooltip content='Vis varsler ( Alt+Ctrl+V )'>
        <Button
          variant='tertiary'
          aria-label='Vis varsler'
          size='medium'
          icon={
            <div className='relative'>
              <BellIcon aria-hidden />
              {hasUnread && <NotificationTick className='absolute right-[7px] top-[3px]' />}
            </div>
          }
          as={Dropdown.Toggle}
        />
      </Tooltip>
      <Dropdown.Menu
        placement='bottom-end'
        className='max-h-[800px] w-[450px] overflow-scroll p-0'
      >
        <Dropdown.Menu.GroupedList>
          <NotificationDrawer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  )
}

const NotificationDrawer = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabName
  setActiveTab: React.Dispatch<React.SetStateAction<TabName>>
}) => {
  const { newsNotifications } = useNewsNotifications()
  const { readNotifications: readNotificationIds } = useReadNotifications()

  const unreadNotifications = newsNotifications.filter(({ id }) => !readNotificationIds.includes(id))

  return (
    <Tabs
      defaultValue={defaultTabName}
      value={activeTab}
      onChange={(value) => setActiveTab(value as TabName)}
    >
      <div className='sticky top-0 z-10'>
        <div className='bg-surface-default'>
          <div className='bg-surface-neutral-subtle p-4'>Varsler</div>
          <Tabs.List>
            <Tabs.Tab
              value='alle'
              label='Alle'
            />
            <Tabs.Tab
              value='nye'
              label='Nye'
            />
          </Tabs.List>
        </div>
      </div>
      <Tabs.Panel value='alle'>
        <NotificationList notifications={newsNotifications} />
      </Tabs.Panel>
      <Tabs.Panel value='nye'>
        <NotificationList notifications={unreadNotifications} />
      </Tabs.Panel>
    </Tabs>
  )
}

const NotificationList = ({ notifications }: { notifications: NewsNotification[] }) => {
  if (notifications.length === 0) {
    return (
      <BodyShort
        textColor='subtle'
        className='p-4'
      >
        Ingen nye varsler
      </BodyShort>
    )
  }

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationItem
          key={`notification-${notification.id}`}
          notification={notification}
          className='border-b-border-subtle p-4 [&:not(:last-child)]:border-b'
        />
      ))}
    </div>
  )
}

const NotificationItem = ({ notification, className }: { notification: NewsNotification; className?: string }) => {
  const { isUnread } = useReadNotifications()

  const date = new Date(notification.createdAt)
  const localeDate = date.toLocaleDateString("no-NB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })

  return (
    <div className={className}>
      <div className='flex items-center gap-2 pb-2'>
        <Detail textColor='subtle'>{localeDate}</Detail>
        {isUnread(notification.id) && <NotificationTick />}
      </div>
      <Heading
        textColor='subtle'
        size='small'
        spacing
      >
        {notification.title}
      </Heading>
      <BodyLong textColor='subtle'>
        <Markdown>{notification.content}</Markdown>
      </BodyLong>
    </div>
  )
}

const NotificationTick = ({ className }: { className?: string }) => {
  return <div className={`h-1.5 w-1.5 animate-ping rounded-full bg-surface-danger ${className}`} />
}
