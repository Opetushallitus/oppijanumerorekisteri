import {
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
} from '../actions/actiontypes';
import { Page } from '../types/Page.types';
import { OppijaList } from '../types/domain/oppijanumerorekisteri/oppijalist.types';
import { OppijaTuontiYhteenveto } from '../types/domain/oppijanumerorekisteri/oppijatuontiyhteenveto.types';

export type TuontiYhteenvetoState = {
    loading: boolean;
    data: OppijaTuontiYhteenveto | {};
};

export type TuontiListausState = {
    loading: boolean;
    data: Page<OppijaList> | any;
};

export const oppijoidenTuontiYhteenveto = (state: TuontiYhteenvetoState = { loading: true, data: {} }, action: any) => {
    switch (action.type) {
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST:
            return { ...state, loading: true };
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS:
            return { ...state, loading: false, data: action.data };
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE:
            return { ...state, loading: false };
        default:
            return state;
    }
};

export const oppijoidenTuontiListaus = (state: TuontiListausState = { loading: true, data: {} }, action: any) => {
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
