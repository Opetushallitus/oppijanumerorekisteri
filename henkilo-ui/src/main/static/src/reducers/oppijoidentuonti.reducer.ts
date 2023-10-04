import { AnyAction } from '@reduxjs/toolkit';
import {
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
} from '../actions/actiontypes';
import { Page } from '../types/Page.types';
import { OppijaList } from '../types/domain/oppijanumerorekisteri/oppijalist.types';

export type TuontiListausState = {
    loading: boolean;
    data: Page<OppijaList> | Record<string, never>;
};

export const oppijoidenTuontiListaus = (
    state: TuontiListausState = { loading: true, data: {} },
    action: AnyAction
): TuontiListausState => {
    switch (action.type) {
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST:
            return { ...state, loading: true };
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS:
            return { ...state, loading: false, data: action.data };
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE:
            return { ...state, loading: false };
        default:
            return state;
    }
};
