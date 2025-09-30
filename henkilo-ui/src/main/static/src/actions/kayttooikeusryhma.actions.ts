import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
} from './actiontypes';
import { AppDispatch } from '../store';

export type Kayttooikeus = {
    id: number;
    kayttoOikeudenTila: string;
    alkupvm: string;
    loppupvm: string;
};

//KAYTTOOIKEUSRYHMAT FOR ORGANISAATIO
const requestOrganisaatioKayttooikeusryhmat = (organisaatioOid) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    organisaatioOid,
});
const requestOrganisaatioKayttooikeusryhmatSuccess = (kayttooikeusryhmat) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    kayttooikeusryhmat,
});
const requestOrganisaatioKayttooikeusryhmatFailure = (error) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
    error,
});
export const fetchOrganisaatioKayttooikeusryhmat = (organisaatioOid) => async (dispatch: AppDispatch) => {
    dispatch(requestOrganisaatioKayttooikeusryhmat(organisaatioOid));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.organisaatio', organisaatioOid);
    try {
        const kayttooikeusryhmat = await http.get(url);
        dispatch(requestOrganisaatioKayttooikeusryhmatSuccess(kayttooikeusryhmat));
    } catch (error) {
        dispatch(requestOrganisaatioKayttooikeusryhmatFailure(error));
        throw error;
    }
};
