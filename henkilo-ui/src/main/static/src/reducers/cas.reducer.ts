import { CREATE_HENKILOBYTOKEN_SUCCESS, FETCH_KUTSUBYTOKEN_FAILURE } from '../actions/actiontypes';

export type CasState = {
    authToken: string;
    temporaryTokenInvalid: boolean;
    loginFailed?: any;
};

const cas = (state: CasState = { authToken: '', temporaryTokenInvalid: false }, action) => {
    switch (action.type) {
        case FETCH_KUTSUBYTOKEN_FAILURE:
            return Object.assign({}, state, { temporaryTokenInvalid: true });
        case CREATE_HENKILOBYTOKEN_SUCCESS:
            return Object.assign({}, state, { authToken: action.authToken });
        default:
            return state;
    }
};

export default cas;
