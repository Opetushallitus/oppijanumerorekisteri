import { NOTIFICATION_REMOVED, NOTIFICATION_ADD, RESET_BUTTON_NOTIFICATIONS } from './actiontypes';

export const removeNotification = (status, group, id) => ({
    type: NOTIFICATION_REMOVED,
    status,
    group,
    id,
});

export const addNotification = (notification: string) => ({
    type: NOTIFICATION_ADD,
    notification,
});

export const resetButtonNotifications = () => ({ type: RESET_BUTTON_NOTIFICATIONS });
