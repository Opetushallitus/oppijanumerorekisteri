import {FETCH_OMATTIEDOT_SUCCESS} from "../actions/actiontypes";

export const locale = (state = 'fi', action) => {
    switch (action.type) {
        case FETCH_OMATTIEDOT_SUCCESS:
            return action.lang || 'fi';
        default:
            return 'fi';
    }

};
