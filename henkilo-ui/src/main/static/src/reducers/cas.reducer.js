
import {CREATE_HENKILOBYTOKEN_SUCCESS, FETCH_KUTSUBYTOKEN_FAILURE} from "../actions/actiontypes";

export const cas = (state = {authToken: '', temporaryTokenInvalid: false,}, action) => {
    switch (action.type) {
        case FETCH_KUTSUBYTOKEN_FAILURE:
            return Object.assign({}, state, {temporaryTokenInvalid: true,});
        case CREATE_HENKILOBYTOKEN_SUCCESS:
            return Object.assign({}, state, {authToken: action.authToken,});
        default:
            return state;
    }
};
