import { NOTIFICATION_REMOVED, RESET_BUTTON_NOTIFICATIONS } from './actiontypes';

export const removeNotification = (status, group, id) => ({
    type: NOTIFICATION_REMOVED,
    status,
    group,
    id,
});

export const resetButtonNotifications = () => ({ type: RESET_BUTTON_NOTIFICATIONS });
