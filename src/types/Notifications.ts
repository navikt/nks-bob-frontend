export type Notification = {
  id: string
  createdAt: string
  expiresAt: string | null
  title: string
  content: string
  notificationType: "News" | "Error" | "Warning"
}

export type NewsNotification = Omit<
  Notification,
  "expiresAt" | "notificationType"
>

export type ErrorNotification = Notification
