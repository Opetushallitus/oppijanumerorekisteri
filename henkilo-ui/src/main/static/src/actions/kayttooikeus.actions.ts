import {
    FETCH_PALVELUKAYTTOOIKEUS_REQUEST,
    FETCH_PALVELUKAYTTOOIKEUS_SUCCESS,
    FETCH_PALVELUKAYTTOOIKEUS_FAILURE,
} from './actiontypes';
import { http } from '../http';
import { urls } from 'oph-urls-js';
import { PalveluKayttooikeus } from '../types/domain/kayttooikeus/palvelukayttooikeus.types';
import { AppDispatch } from '../store';

export type PalveluKayttooikeusAction = {
    type: string;
    payload?: Array<PalveluKayttooikeus>;
    error?: unknown;
};

const requestPalveluKayttooikeus = (): PalveluKayttooikeusAction => ({
    type: FETCH_PALVELUKAYTTOOIKEUS_REQUEST,
});
const requestPalveluKayttooikeusSuccess = (payload: PalveluKayttooikeus[]): PalveluKayttooikeusAction => ({
    type: FETCH_PALVELUKAYTTOOIKEUS_SUCCESS,
    payload,
});
const requestPalveluKayttooikeusFailure = (error): PalveluKayttooikeusAction => ({
    type: FETCH_PALVELUKAYTTOOIKEUS_FAILURE,
    error,
});

export const fetchPalveluKayttooikeus = (palveluName: string) => async (dispatch: AppDispatch) => {
    dispatch(requestPalveluKayttooikeus());
    const url = urls.url('kayttooikeus-service.kayttooikeus.listaus', palveluName);
    try {
        const data = await http.get<PalveluKayttooikeus[]>(url);
        dispatch(requestPalveluKayttooikeusSuccess(data));
    } catch (error) {
        dispatch(requestPalveluKayttooikeusFailure(error));
        throw error;
    }
};
