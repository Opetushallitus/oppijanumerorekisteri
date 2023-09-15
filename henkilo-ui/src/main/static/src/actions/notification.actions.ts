import { GLOBAL_NOTIFICATION } from './actiontypes';
import { GlobalNotificationConfig } from '../types/notification.types';

export const addGlobalNotification = (payload: GlobalNotificationConfig) => ({
    type: GLOBAL_NOTIFICATION.ADD,
    payload,
});

export const removeGlobalNotification = (key: string) => ({ type: GLOBAL_NOTIFICATION.REMOVE, key });
