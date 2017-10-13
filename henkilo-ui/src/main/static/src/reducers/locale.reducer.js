import {FETCH_OMATTIEDOT_SUCCESS} from "../actions/actiontypes";

type Action = { lang: string };

export const locale = (state = 'fi', action: Action): string => {
    switch (action.type) {
        case FETCH_OMATTIEDOT_SUCCESS:
            return action.lang || 'fi';
        default:
            return 'fi';
    }

};
