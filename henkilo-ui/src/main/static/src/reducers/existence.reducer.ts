import {
    CLEAR_EXISTENCE_CHECK,
    FETCH_EXISTENCE_CHECK_REQUEST,
    FETCH_EXISTENCE_CHECK_SUCCESS,
    FETCH_EXISTENCE_CHECK_FAILURE,
} from '../actions/actiontypes';

export type ExistenceCheckRequest = {
    ssn: string;
    firstName: string;
    nickName: string;
    lastName: string;
};

export type ExistenceCheckReponse = {
    oid: string;
};

export type ClearAction = {
    type: typeof CLEAR_EXISTENCE_CHECK;
};

export type RequestAction = {
    type: typeof FETCH_EXISTENCE_CHECK_REQUEST;
};

export type SuccessAction = {
    type: typeof FETCH_EXISTENCE_CHECK_SUCCESS;
    data: ExistenceCheckReponse;
    status: number;
};

export type FailureAction = {
    type: typeof FETCH_EXISTENCE_CHECK_FAILURE;
    status?: number;
};

export type ExistenceCheckState = {
    loading: boolean;
    data?: ExistenceCheckReponse;
    status?: number;
};

export const initialState: ExistenceCheckState = {
    loading: false,
    data: undefined,
    status: undefined,
};

export const existenceCheckReducer = (
    state: ExistenceCheckState = initialState,
    action: ClearAction | RequestAction | SuccessAction | FailureAction | never
): ExistenceCheckState => {
    switch (action.type) {
        case FETCH_EXISTENCE_CHECK_REQUEST:
            return { ...initialState, loading: true };
        case FETCH_EXISTENCE_CHECK_SUCCESS:
            return { ...initialState, data: action.data, status: action.status };
        case FETCH_EXISTENCE_CHECK_FAILURE:
            return { ...initialState, status: action.status };
        case CLEAR_EXISTENCE_CHECK:
            return initialState;
        default:
            return state;
    }
};

export default existenceCheckReducer;
