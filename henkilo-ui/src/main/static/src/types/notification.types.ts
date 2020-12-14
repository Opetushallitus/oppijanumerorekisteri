export type NotificationType = "success" | "warning" | "error" | "info"

export type NotificationTypes = {
    SUCCESS: "success"
    WARNING: "warning"
    INFO: "info"
    ERROR: "error"
}

export type GlobalNotificationConfig = {
    key: string
    type: NotificationType
    title: string
    autoClose?: number
}