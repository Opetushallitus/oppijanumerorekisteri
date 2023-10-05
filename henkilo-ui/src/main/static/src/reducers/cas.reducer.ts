import { AnyAction } from '@reduxjs/toolkit';
import { CREATE_HENKILOBYTOKEN_SUCCESS } from '../actions/actiontypes';

export type CasState = {
    authToken: string;
    temporaryTokenInvalid: boolean;
};

const cas = (state: CasState = { authToken: '', temporaryTokenInvalid: false }, action: AnyAction): CasState => {
    switch (action.type) {
        case CREATE_HENKILOBYTOKEN_SUCCESS:
            return Object.assign({}, state, { authToken: action.authToken });
        default:
            return state;
    }
};

export default cas;
