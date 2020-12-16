import { http } from '../http';
import { urls } from 'oph-urls-js';
import { fetchOrganisations } from './organisaatio.actions';
import {
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE,
    CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT,
} from './actiontypes';
import { Dispatch } from '../types/dispatch.type';
import { FetchHaetutKayttooikeusryhmatParameters } from '../components/anomus/AnomusPage';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';

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
    dispatch: Dispatch
) => {
    dispatch(requestHaetutKayttooikeusryhmat());
    const url = urls.url('kayttooikeus-service.anomus.haetut-kayttooikeusryhmat', parameters);
    try {
        const haetutKayttooikeusryhmat = await http.get<HaettuKayttooikeusryhma[]>(url);
        await dispatch(
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

export const clearHaetutKayttooikeusryhmat = () => (dispatch: Dispatch) =>
    dispatch({ type: CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT });
