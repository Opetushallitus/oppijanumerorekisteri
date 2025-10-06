import {
    FETCH_HENKILO_REQUEST,
    FETCH_HENKILO_SUCCESS,
    FETCH_HENKILO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    CLEAR_HENKILO,
    UPDATE_HENKILO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,
} from '../actions/actiontypes';
import type { Henkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import type { Hakemus } from '../types/domain/oppijanumerorekisteri/Hakemus.type';
import { AnyAction } from '@reduxjs/toolkit';

export type HenkiloState = {
    readonly henkiloLoading: boolean;
    readonly henkiloKayttoEstetty: boolean;
    readonly henkilo: Henkilo;
    readonly hakemuksetLoading: boolean;
    readonly hakemukset: Array<Hakemus>;
};

export const isHenkiloStateLoading = (state: HenkiloState) => state.henkiloLoading || state.hakemuksetLoading;

const initialState: HenkiloState = {
    henkiloLoading: true,
    henkiloKayttoEstetty: false,
    henkilo: {} as Henkilo,
    hakemuksetLoading: false,
    hakemukset: [],
};

const isKayttoEstetty = (data?: { status: number; path: string; message: string }) =>
    data?.status === 403 || // oppijanumerorekisteri palauttaa väärän status-koodin
    isKayttoEstettyOppijanumerorekisteri(data);

const isKayttoEstettyOppijanumerorekisteri = (data?: { status: number; path: string; message: string }) => {
    if (typeof data === 'object' && data !== null) {
        const { status, path } = data;
        return status === 401 && path?.startsWith('/oppijanumerorekisteri-service/');
    }
    return false;
};

export const henkilo = (state: Readonly<HenkiloState> = initialState, action: AnyAction): HenkiloState => {
    switch (action.type) {
        case UPDATE_HENKILO_REQUEST:
        case FETCH_HENKILO_REQUEST:
            return { ...state, henkiloLoading: true };
        case FETCH_HENKILO_SUCCESS:
            return { ...state, henkiloLoading: false, henkilo: action.henkilo };
        case FETCH_HENKILO_FAILURE:
            return {
                ...state,
                henkiloLoading: false,
                henkiloKayttoEstetty: isKayttoEstetty(action.data),
            };
        case UPDATE_HENKILO_FAILURE:
            return { ...state, henkiloLoading: false };
        case FETCH_HENKILO_HAKEMUKSET.REQUEST:
            return { ...state, hakemuksetLoading: true };
        case FETCH_HENKILO_HAKEMUKSET.SUCCESS:
            return {
                ...state,
                hakemuksetLoading: false,
                hakemukset: action.hakemukset,
            };
        case FETCH_HENKILO_HAKEMUKSET.FAILURE:
            return { ...state, hakemuksetLoading: false };
        case CLEAR_HENKILO:
            return { ...state, ...initialState };
        default:
            return state;
    }
};
