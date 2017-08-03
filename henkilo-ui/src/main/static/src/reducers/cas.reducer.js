
import {CREATE_HENKILOBYTOKEN_SUCCESS, FETCH_KUTSUBYTOKEN_FAILURE, LOGIN_FAILED} from "../actions/actiontypes";

export const cas = (state = {loginFailed: false, authToken: '', temporaryTokenInvalid: false,}, action) => {
    switch (action.type) {
        case LOGIN_FAILED:
            return Object.assign({}, state, {loginFailed: true,});
        case FETCH_KUTSUBYTOKEN_FAILURE:
            return Object.assign({}, state, {temporaryTokenInvalid: true,});
        case CREATE_HENKILOBYTOKEN_SUCCESS:
            return Object.assign({}, state, {authToken: action.authToken,});
        default:
            return state;
    }
};
