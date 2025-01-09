import { AnyAction } from '@reduxjs/toolkit';
import { FETCH_ALL_RYHMAT_REQUEST, FETCH_ALL_RYHMAT_SUCCESS, FETCH_ALL_RYHMAT_FAILURE } from '../actions/actiontypes';
import { OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';

export type RyhmatState = {
    readonly ryhmas: Array<OrganisaatioWithChildren>;
    readonly ryhmasLoading: boolean;
};

const initialState: RyhmatState = {
    ryhmasLoading: false,
    ryhmas: [],
};

export const ryhmatState = (state: Readonly<RyhmatState> = initialState, action: AnyAction): RyhmatState => {
    switch (action.type) {
        case FETCH_ALL_RYHMAT_REQUEST:
            return { ...state, ryhmasLoading: true, ryhmas: [] };
        case FETCH_ALL_RYHMAT_SUCCESS:
            return { ...state, ryhmasLoading: false, ryhmas: action.ryhmas };
        case FETCH_ALL_RYHMAT_FAILURE:
            return { ...state, ryhmasLoading: false };
        default:
            return state;
    }
};
