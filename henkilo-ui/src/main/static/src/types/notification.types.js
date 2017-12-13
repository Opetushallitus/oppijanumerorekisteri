// @flow

export type NotificationType = 'success'| 'warning' | 'error' | 'info';

export type NotificationTypes = {
    SUCCESS: NotificationType,
    WARNING: NotificationType,
    INFO: NotificationType,
    ERROR: NotificationType
}

export type GlobalNotificationConfig = {
    key: string,
    type: NotificationType,
    title: string,
    autoClose?: number
}

