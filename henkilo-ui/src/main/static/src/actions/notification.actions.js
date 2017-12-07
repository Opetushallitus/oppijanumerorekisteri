// @flow

import {NOTIFICATION_ADD, NOTIFICATION_REMOVE} from "./actiontypes";

export const addNotification = (key: string) => ({ type: NOTIFICATION_ADD, key });
export const clearNotification = (key: string) => ({ type: NOTIFICATION_REMOVE, key});