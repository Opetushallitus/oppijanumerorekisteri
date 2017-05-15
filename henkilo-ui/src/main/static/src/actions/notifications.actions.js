import {NOTIFICATION_REMOVED} from "./actiontypes";

export const removeNotification = (status, group, id) => ({type: NOTIFICATION_REMOVED, status, group, id,});
