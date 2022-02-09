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
    oid?: string;
    msgKey?: string;
    status?: number;
};

export const initialState: ExistenceCheckState = {
    loading: false,
    oid: undefined,
    msgKey: undefined,
    status: undefined,
};

export const statusToMessage = {
    200: 'EXISTENCE_CHECK_ONR',
    204: 'EXISTENCE_CHECK_VTJ',
    400: 'EXISTENCE_CHECK_BAD_REQUEST',
    404: 'EXISTENCE_CHECK_NOK',
    409: 'EXISTENCE_CHECK_CONFLICT',
};

export const existenceCheckReducer = (
    state: ExistenceCheckState = initialState,
    action: ClearAction | RequestAction | SuccessAction | FailureAction | never
): ExistenceCheckState => {
    switch (action.type) {
        case FETCH_EXISTENCE_CHECK_REQUEST:
            return { ...initialState, loading: true };
        case FETCH_EXISTENCE_CHECK_SUCCESS:
            return {
                ...initialState,
                oid: action.data.oid,
                msgKey: statusToMessage[action.status],
                status: action.status,
            };
        case FETCH_EXISTENCE_CHECK_FAILURE:
            return { ...initialState };
        case CLEAR_EXISTENCE_CHECK:
            return initialState;
        default:
            return state;
    }
};

export default existenceCheckReducer;
