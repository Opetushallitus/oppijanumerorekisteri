import { AnyAction } from '@reduxjs/toolkit';
import {
    FETCH_KUTSU_SUCCESS,
    FETCH_KUTSU_REQUEST,
    CLEAR_KUTSU_LIST,
    FETCH_KUTSU_FAILURE,
} from '../actions/actiontypes';
import { KutsuByToken, KutsuRead } from '../types/domain/kayttooikeus/Kutsu.types';

export type KutsuListState = {
    loaded: boolean;
    result: Array<KutsuRead>;
    kutsuByToken: KutsuByToken;
    kutsuByTokenLoading: boolean;
};

const kutsuList = (
    state: KutsuListState = {
        loaded: false,
        result: [],
        kutsuByToken: undefined,
        kutsuByTokenLoading: true,
    },
    action: AnyAction
): KutsuListState => {
    switch (action.type) {
        case FETCH_KUTSU_REQUEST:
            return Object.assign({}, state, { loaded: false });
        case FETCH_KUTSU_SUCCESS:
            return Object.assign({}, state, {
                result: [...state.result, ...action.kutsus],
                loaded: true,
            });
        case FETCH_KUTSU_FAILURE:
            return { ...state, loaded: false };
        case CLEAR_KUTSU_LIST:
            return Object.assign({}, state, { result: [] });
        default:
            return state;
    }
};

export default kutsuList;
