import {
    CLEAR_HENKILOHAKU,
    HENKILOHAKU_FAILURE,
    HENKILOHAKU_REQUEST,
    HENKILOHAKU_SUCCESS,
    HENKILOHAKUCOUNT_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS,
} from '../actions/actiontypes';
import { HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HenkilohakuResult } from '../types/domain/kayttooikeus/HenkilohakuResult.types';

export type HenkilohakuState = {
    readonly filters: HenkilohakuCriteria;
    readonly henkilohakuLoading: boolean;
    readonly resultCount: number;
    readonly result: Array<HenkilohakuResult>;
};

const initialState: HenkilohakuState = {
    filters: {
        noOrganisation: false,
        subOrganisation: true,
        passivoitu: false,
        dublicates: false,
    },
    henkilohakuLoading: false,
    resultCount: 0,
    result: [],
};

export const henkilohakuState = (state = initialState, action: any): HenkilohakuState => {
    switch (action.type) {
        case HENKILOHAKU_REQUEST:
            return { ...state, henkilohakuLoading: true, filters: action.filters };
        case HENKILOHAKU_SUCCESS:
            return {
                ...state,
                henkilohakuLoading: false,
                result: [...state.result, ...action.data],
            };
        case HENKILOHAKU_FAILURE:
            return { ...state, henkilohakuLoading: false };
        case HENKILOHAKUCOUNT_SUCCESS:
            return {
                ...state,
                resultCount: action.count,
            };
        case UPDATE_HENKILOHAKU_FILTERS:
            return { ...state, filters: action.filters };
        case CLEAR_HENKILOHAKU:
            return { ...state, result: [] };
        default:
            return state;
    }
};
