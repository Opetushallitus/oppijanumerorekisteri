import { http } from '../http';
import { urls } from 'oph-urls-js';
import { fetchOrganisations } from './organisaatio.actions';
import {
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE,
    CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT,
} from './actiontypes';
import { FetchHaetutKayttooikeusryhmatParameters } from '../components/anomus/AnomusPage';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { AppDispatch } from '../store';

const requestHaetutKayttooikeusryhmat = () => ({
    type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST,
});
const receiveHaetutKayttooikeusryhmatSuccess = (json) => ({
    type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    haetutKayttooikeusryhmat: json,
});
const receiveHaetutKayttooikeusryhmatFailure = (nimi?: string) => ({
    type: FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE,
    nimi,
});

export const fetchHaetutKayttooikeusryhmat = (parameters: FetchHaetutKayttooikeusryhmatParameters) => async (
    dispatch: AppDispatch
) => {
    dispatch(requestHaetutKayttooikeusryhmat());
    const url = urls.url('kayttooikeus-service.anomus.haetut-kayttooikeusryhmat', parameters);
    try {
        const haetutKayttooikeusryhmat = await http.get<HaettuKayttooikeusryhma[]>(url);
        await dispatch<any>(
            fetchOrganisations(
                haetutKayttooikeusryhmat.map(
                    (haettuKayttooikeusryhma: HaettuKayttooikeusryhma) => haettuKayttooikeusryhma.anomus.organisaatioOid
                )
            )
        );
        dispatch(receiveHaetutKayttooikeusryhmatSuccess(haetutKayttooikeusryhmat));
    } catch (error) {
        dispatch(receiveHaetutKayttooikeusryhmatFailure());
        throw error;
    }
};

export const clearHaetutKayttooikeusryhmat = () => (dispatch: AppDispatch) =>
    dispatch({ type: CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT });
