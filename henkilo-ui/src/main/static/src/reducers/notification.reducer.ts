import { GLOBAL_NOTIFICATION } from '../actions/actiontypes';
import { GlobalNotificationConfig } from '../types/notification.types';

export type NoficationListState = Array<GlobalNotificationConfig>;

type Action = any; // AddAction | RemoveAction

/*
type AddAction = {
    type: string,
    payload: GlobalNotificationConfig
}

type RemoveAction = {
    type: string,
    key: string
}
*/
export const notificationList = (state: NoficationListState = [], action: Action): NoficationListState => {
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
