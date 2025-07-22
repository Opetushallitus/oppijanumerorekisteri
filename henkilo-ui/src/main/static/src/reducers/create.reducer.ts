import { AnyAction } from '@reduxjs/toolkit';
import { CREATE_PERSON_REQUEST, CREATE_PERSON_SUCCESS, CREATE_PERSON_FAILURE } from '../actions/actiontypes';

export type RequestAction = {
    type: typeof CREATE_PERSON_REQUEST;
};

export type SuccessAction = {
    type: typeof CREATE_PERSON_SUCCESS;
    oid: string;
    status: number;
};

export type FailureAction = {
    type: typeof CREATE_PERSON_FAILURE;
    status?: number;
};

export type CreatePersonState = {
    loading: boolean;
    oid?: string;
    status?: number;
};

export const initialState: CreatePersonState = {
    loading: false,
    oid: undefined,
    status: undefined,
};

export const createPersonReducer = (
    state: Readonly<CreatePersonState> = initialState,
    action: AnyAction
): CreatePersonState => {
    switch (action.type) {
        case CREATE_PERSON_REQUEST:
            return { ...initialState, loading: true };
        case CREATE_PERSON_SUCCESS:
            return {
                ...initialState,
                oid: action.oid,
                status: action.status,
            };
        case CREATE_PERSON_FAILURE:
            return { ...initialState, status: action.status };
        default:
            return state;
    }
};

export default createPersonReducer;
