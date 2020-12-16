export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'ok'; // TODO: 'ok' added because it was used in Notifications.tsx

export type NotificationTypes = {
    SUCCESS: 'success';
    WARNING: 'warning';
    INFO: 'info';
    ERROR: 'error';
};

export type GlobalNotificationConfig = {
    key: string;
    type: NotificationType;
    title: string;
    autoClose?: number;
};
