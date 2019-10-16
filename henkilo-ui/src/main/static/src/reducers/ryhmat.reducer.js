// @flow
import { FETCH_ALL_RYHMAT_REQUEST, FETCH_ALL_RYHMAT_SUCCESS, FETCH_ALL_RYHMAT_FAILURE } from '../actions/actiontypes';
import type {OrganisaatioWithChildren} from "../types/domain/organisaatio/organisaatio.types";

export type RyhmatState = {|
    +ryhmas: Array<OrganisaatioWithChildren>,
    +ryhmasLoading: boolean
|}

const initialState: RyhmatState = {
    ryhmasLoading: false,
    ryhmas: []
};

export const ryhmatState = (state: RyhmatState = initialState, action: any) => {
    switch (action.type) {
        case FETCH_ALL_RYHMAT_REQUEST:
            return {...state, ryhmasLoading: true, ryhmas: []};
        case FETCH_ALL_RYHMAT_SUCCESS:
            return {...state, ryhmasLoading: false, ryhmas: action.ryhmas};
        case FETCH_ALL_RYHMAT_FAILURE:
            return {...state, ryhmasLoading: false, };
        default:
            return state;
    }
};
