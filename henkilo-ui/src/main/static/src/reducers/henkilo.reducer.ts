import {
    FETCH_HENKILO_REQUEST,
    FETCH_HENKILO_SUCCESS,
    FETCH_HENKILO_FAILURE,
    FETCH_KAYTTAJA_REQUEST,
    FETCH_KAYTTAJA_SUCCESS,
    FETCH_KAYTTAJA_FAILURE,
    FETCH_KAYTTAJATIETO_FAILURE,
    FETCH_KAYTTAJATIETO_REQUEST,
    FETCH_KAYTTAJATIETO_SUCCESS,
    UPDATE_KAYTTAJATIETO_REQUEST,
    UPDATE_KAYTTAJATIETO_SUCCESS,
    UPDATE_KAYTTAJATIETO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    CLEAR_HENKILO,
    UPDATE_HENKILO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,
} from '../actions/actiontypes';
import type { Henkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import type { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';
import type { Hakemus } from '../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { Kayttaja } from '../types/domain/kayttooikeus/kayttaja.types';
import { AnyAction } from '@reduxjs/toolkit';

export type HenkiloState = {
    readonly henkiloLoading: boolean;
    readonly kayttajaLoading: boolean;
    readonly kayttajatietoLoading: boolean;
    readonly henkiloKayttoEstetty: boolean;
    readonly henkilo: Henkilo;
    readonly kayttaja: Kayttaja;
    readonly kayttajatieto?: KayttajatiedotRead;
    readonly hakemuksetLoading: boolean;
    readonly hakemukset: Array<Hakemus>;
};

export const isHenkiloStateLoading = (state: HenkiloState) =>
    state.henkiloLoading || state.kayttajaLoading || state.kayttajatietoLoading || state.hakemuksetLoading;

const initialState: HenkiloState = {
    henkiloLoading: true,
    kayttajaLoading: false,
    kayttajatietoLoading: false,
    henkiloKayttoEstetty: false,
    henkilo: {} as Henkilo,
    kayttaja: {} as Kayttaja,
    kayttajatieto: undefined,
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
        case FETCH_KAYTTAJA_REQUEST:
            return { ...state, kayttajaLoading: true };
        case FETCH_KAYTTAJA_FAILURE:
            return { ...state, kayttajaLoading: false };
        case FETCH_KAYTTAJA_SUCCESS:
            return { ...state, kayttajaLoading: false, kayttaja: action.kayttaja };
        case FETCH_KAYTTAJATIETO_REQUEST:
            return { ...state, kayttajatietoLoading: true };
        case FETCH_KAYTTAJATIETO_SUCCESS:
        case FETCH_KAYTTAJATIETO_FAILURE:
            return { ...state, kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto };
        case UPDATE_KAYTTAJATIETO_REQUEST:
            return { ...state, kayttajatietoLoading: true };
        case UPDATE_KAYTTAJATIETO_SUCCESS:
            return { ...state, kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto };
        case UPDATE_KAYTTAJATIETO_FAILURE:
            return {
                ...state,
                kayttajatietoLoading: false,
                kayttajatieto: state.kayttajatieto,
            };
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
