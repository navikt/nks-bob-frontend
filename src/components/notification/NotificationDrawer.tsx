import { BellIcon } from "@navikt/aksel-icons"
import {
  BodyLong,
  BodyShort,
  Button,
  Detail,
  Dropdown,
  Heading,
  Tabs,
  Tooltip,
} from "@navikt/ds-react"
import { useState } from "react"
import Markdown from "react-markdown"
import { useNewsNotifications } from "../../api/api"
import { NewsNotification } from "../../types/Notifications"

/* const useReadNotifications = () => {
  const [readNotifications, setReadNotifications] =
    useUpdateLocalStorage("readNotifications")

  const updateReadNotifications = (notificationIds: string[]) => {
    setReadNotifications(new Set([...readNotifications, ...notificationIds]))
  }

  return {
    readNotifications: (readNotifications as string[] | undefined) ?? [],
    updateReadNotifications,
  }
} */

export const NotificationToggle = () => {
  return (
    <Dropdown>
      <Tooltip content='Vis varsler'>
        <Button
          variant='tertiary'
          size='medium'
          icon={<BellIcon aria-hidden />}
          as={Dropdown.Toggle}
        />
      </Tooltip>
      <Dropdown.Menu
        placement='bottom-end'
        className='max-h-[500px] w-[450px] overflow-scroll p-0'
      >
        <Dropdown.Menu.GroupedList>
          <NotificationDrawer />
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  )
}

const NotificationDrawer = () => {
  const { newsNotifications } = useNewsNotifications()
  const [unreadNotifications] = useState<NewsNotification[]>([])
  // const { readNotifications } = useReadNotifications()

  // useEffect(() => {
  //   if (!isLoading) {
  //     setUnreadNotifications(
  //       newsNotifications.filter(({ id }) => !readNotifications.includes(id)),
  //     )
  //   }
  // }, [newsNotifications, isLoading, readNotifications])

  // console.log(unreadNotifications)

  return (
    <>
      <Tabs defaultValue='alle'>
        <div className='sticky top-0'>
          <div className='bg-surface-default'>
            <div className='bg-surface-neutral-subtle p-4'>Varsler</div>
            <Tabs.List>
              <Tabs.Tab value='alle' label='Alle' />
              <Tabs.Tab value='uleste' label='Uleste' />
            </Tabs.List>
          </div>
        </div>
        <Tabs.Panel value='alle'>
          <NotificationList notifications={newsNotifications} />
        </Tabs.Panel>
        <Tabs.Panel value='uleste'>
          <NotificationList notifications={unreadNotifications} />
        </Tabs.Panel>
      </Tabs>
    </>
  )
}

const NotificationList = ({
  notifications,
}: {
  notifications: NewsNotification[]
}) => {
  if (notifications.length === 0) {
    return (
      <BodyShort textColor='subtle' className='p-4'>
        Her var det tomt gitt...
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

const NotificationItem = ({
  notification,
  className,
}: {
  notification: NewsNotification
  className?: string
}) => {
  const date = new Date(notification.createdAt)
  const localeDate = date.toLocaleDateString("no-NB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })

  return (
    <div className={className}>
      <Detail className='text-text-subtle' spacing>
        {localeDate}
      </Detail>
      <Heading textColor='subtle' size='small' spacing>
        {notification.title}
      </Heading>
      <BodyLong textColor='subtle'>
        <Markdown>{notification.content}</Markdown>
      </BodyLong>
    </div>
  )
}
