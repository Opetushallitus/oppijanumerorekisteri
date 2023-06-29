import {
    FETCH_KUTSU_SUCCESS,
    FETCH_KUTSU_REQUEST,
    FETCH_KUTSUBYTOKEN_REQUEST,
    FETCH_KUTSUBYTOKEN_SUCCESS,
    FETCH_KUTSUBYTOKEN_FAILURE,
    CLEAR_KUTSU_LIST,
    FETCH_KUTSU_FAILURE,
} from '../actions/actiontypes';
import { KutsuRead } from '../types/domain/kayttooikeus/Kutsu.types';

export type KutsuListState = {
    loaded: boolean;
    result: Array<KutsuRead>;
    kutsuByToken: KutsuRead | {};
    kutsuByTokenLoading: boolean;
};

const kutsuList = (
    state: KutsuListState = {
        loaded: false,
        result: [],
        kutsuByToken: {},
        kutsuByTokenLoading: true,
    },
    action: any
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
        case FETCH_KUTSUBYTOKEN_REQUEST:
            return Object.assign({}, state, { kutsuByTokenLoading: true });
        case FETCH_KUTSUBYTOKEN_SUCCESS:
            return Object.assign({}, state, {
                kutsuByTokenLoading: false,
                kutsuByToken: action.kutsu,
            });
        case FETCH_KUTSUBYTOKEN_FAILURE:
            return Object.assign({}, state, { kutsuByTokenLoading: false });
        case CLEAR_KUTSU_LIST:
            return Object.assign({}, state, { result: [] });
        default:
            return state;
    }
};

export default kutsuList;
