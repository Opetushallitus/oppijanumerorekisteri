import { AnyAction } from '@reduxjs/toolkit';

import {
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_REQUEST,
} from '../actions/actiontypes';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';

export type AllowedKayttooikeus = Array<MyonnettyKayttooikeusryhma>;

export type KayttooikeusRyhmaState = {
    readonly kayttooikeusAnomus?: Array<HaettuKayttooikeusryhma>;
    readonly kayttooikeusAnomusLoading: boolean;
    readonly kayttooikeusryhma: Kayttooikeusryhma | null | undefined;
    readonly kayttooikeusryhmaLoading: boolean;
    readonly kayttooikeusryhmaSlaves: Array<Kayttooikeusryhma>;
    readonly kayttooikeusryhmaSlavesLoading: boolean;
};

export const isKayttooikeusryhmaStateLoading = (state: KayttooikeusRyhmaState) =>
    state.kayttooikeusAnomusLoading || state.kayttooikeusryhmaLoading || state.kayttooikeusryhmaSlavesLoading;

export const getEmptyKayttooikeusRyhmaState = (): KayttooikeusRyhmaState => {
    return {
        kayttooikeusAnomusLoading: true,
        kayttooikeusAnomus: [],
        kayttooikeusryhma: null,
        kayttooikeusryhmaLoading: false,
        kayttooikeusryhmaSlaves: [],
        kayttooikeusryhmaSlavesLoading: false,
    };
};

export const kayttooikeus = (
    state: Readonly<KayttooikeusRyhmaState> = getEmptyKayttooikeusRyhmaState(),
    action: AnyAction
): KayttooikeusRyhmaState => {
    switch (action.type) {
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST:
            return { ...state, kayttooikeusAnomusLoading: true };
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS:
            return { ...state, kayttooikeusAnomusLoading: false, kayttooikeusAnomus: action.kayttooikeusAnomus };
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE:
            return { ...state, kayttooikeusAnomusLoading: false, kayttooikeusAnomus: [] };
        case FETCH_KAYTTOOIKEUSRYHMA_BY_ID_REQUEST:
            return { ...state, kayttooikeusryhmaLoading: true };
        case FETCH_KAYTTOOIKEUSRYHMA_BY_ID_SUCCESS:
            return {
                ...state,
                kayttooikeusryhmaLoading: false,
                kayttooikeusryhma: action.payload,
            };
        case FETCH_KAYTTOOIKEUSRYHMA_BY_ID_FAILURE:
            return { ...state, kayttooikeusryhmaLoading: false };
        case FETCH_KAYTTOOIKEUSRYHMA_SLAVES_REQUEST:
            return { ...state, kayttooikeusryhmaSlavesLoading: true };
        case FETCH_KAYTTOOIKEUSRYHMA_SLAVES_SUCCESS:
            return {
                ...state,
                kayttooikeusryhmaSlavesLoading: false,
                kayttooikeusryhmaSlaves: action.payload,
            };
        case FETCH_KAYTTOOIKEUSRYHMA_SLAVES_FAILURE:
            return { ...state, kayttooikeusryhmaSlavesLoading: false };
        default:
            return state;
    }
};
