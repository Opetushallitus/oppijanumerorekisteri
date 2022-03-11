import { GLOBAL_NOTIFICATION } from '../actions/actiontypes';
import { GlobalNotificationConfig } from '../types/notification.types';

export type NotificationListState = GlobalNotificationConfig[];

type Action = any; // AddAction | RemoveAction

export const notificationList = (state: NotificationListState = [], action: Action): NotificationListState => {
    switch (action.type) {
        case GLOBAL_NOTIFICATION.ADD:
            return state.some(
                (globalNotification: GlobalNotificationConfig) => globalNotification.key === action.payload.key
            )
                ? state
                : [action.payload, ...state];
        case GLOBAL_NOTIFICATION.REMOVE:
            return state.filter(
                (globalNotification: GlobalNotificationConfig) => globalNotification.key !== action.key
            );
        default:
            return state;
    }
};
