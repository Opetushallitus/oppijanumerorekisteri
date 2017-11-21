// @flow
import {FETCH_HENKILO_ASIOINTIKIELI_SUCCESS} from "../actions/actiontypes";
import type {Locale} from "../types/locale.type";

type Action = {
    lang: string,
    type: string,
};

export const locale = (state: Locale = 'fi', action: Action): Locale => {
    switch (action.type) {
        case FETCH_HENKILO_ASIOINTIKIELI_SUCCESS:
            return action.lang || 'fi';
        default:
            return 'fi';
    }
};
