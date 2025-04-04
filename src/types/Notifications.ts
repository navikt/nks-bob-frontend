export type Notification = {
  id: string
  createdAt: string
  expiresAt: string
  title: string
  content: string
  notificationType: "News" | "Error"
}

export type NewsNotification = Omit<
  Notification,
  "expiresAt" | "notificationType"
>

export type ErrorNotification = Omit<Notification, "expiresAt">
