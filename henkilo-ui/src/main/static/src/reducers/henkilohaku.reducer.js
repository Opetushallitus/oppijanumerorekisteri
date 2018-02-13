// @flow

import {
    CLEAR_HENKILOHAKU,
    HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS
} from "../actions/actiontypes";
import type {HenkilohakuCriteria} from "../types/domain/kayttooikeus/HenkilohakuCriteria.types";
import type {HenkilohakuResult} from "../types/domain/kayttooikeus/HenkilohakuResult.types";

export type HenkilohakuState = {
    +filters?: HenkilohakuCriteria,
    +henkilohakuLoading?: boolean,
    +result: Array<HenkilohakuResult>
}

const initialState: HenkilohakuState = {
    filters: undefined,
    henkilohakuLoading: false,
    result: []
};

export const henkilohakuState: any = (state = initialState, action: any ): HenkilohakuState => {
    switch (action.type) {
        case HENKILOHAKU_REQUEST:
            return {...state, henkilohakuLoading: true, filters: action.filters };
        case HENKILOHAKU_SUCCESS:
            return {...state, henkilohakuLoading: false, result: [...state.result, ...action.data]};
        case HENKILOHAKU_FAILURE:
            return { ...state, henkilohakuLoading: false };
        case UPDATE_HENKILOHAKU_FILTERS:
            return { ...state, filters: action.filters};
        case CLEAR_HENKILOHAKU:
            return { ...state, result: []};
        default:
            return state;
    }
};
