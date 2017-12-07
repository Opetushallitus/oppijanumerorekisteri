// @flow

import {NOTIFICATION_ADD, NOTIFICATION_REMOVE} from "../actions/actiontypes";

type State = Array<string>;

type Action = {
    type: string,
    key: string
}

export const notificationList = ( state: State = [], action: Action) => {

    switch (action.type) {
        case NOTIFICATION_ADD:
            return [ action.key, ...state];
        case NOTIFICATION_REMOVE:
            return state.filter( (key: string) => key !== action.key);
        default:
            return state;
    }

};