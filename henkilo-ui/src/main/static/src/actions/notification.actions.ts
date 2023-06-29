import { GLOBAL_NOTIFICATION } from './actiontypes';
import { GlobalNotificationConfig } from '../types/notification.types';
import { AppDispatch } from '../store';

export const addGlobalNotification = (payload: GlobalNotificationConfig) => (dispatch: AppDispatch) =>
    dispatch({ type: GLOBAL_NOTIFICATION.ADD, payload });

export const removeGlobalNotification = (key: string) => (dispatch: AppDispatch) =>
    dispatch({ type: GLOBAL_NOTIFICATION.REMOVE, key });
