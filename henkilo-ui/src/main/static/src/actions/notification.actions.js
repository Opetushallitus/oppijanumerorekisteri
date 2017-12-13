// @flow

import {GLOBAL_NOTIFICATION} from "./actiontypes";
import type {GlobalNotificationConfig} from "../types/notification.types";

export const addGlobalNotification = (payload: GlobalNotificationConfig) =>
    (dispatch: any) => dispatch({ type: GLOBAL_NOTIFICATION.ADD, payload });

export const removeGlobalNotification = (key: string) =>
    (dispatch: any) => dispatch({ type: GLOBAL_NOTIFICATION.REMOVE, key});