import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
    CREATE_KAYTTOOIKEUSANOMUS_REQUEST,
    CREATE_KAYTTOOIKEUSANOMUS_SUCCESS,
    CREATE_KAYTTOOIKEUSANOMUS_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_FAILURE,
} from './actiontypes';
import { AppDispatch } from '../store';

export type Kayttooikeus = {
    id: number;
    kayttoOikeudenTila: string;
    alkupvm: string;
    loppupvm: string;
};

export type KayttooikeusAnomus = {
    organisaatioOrRyhmaOid: string;
    email: string;
    perustelut: string;
    kayttooikeusRyhmaIds: number[];
    anojaOid: string;
};

const requestAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    henkiloOid,
});
const receiveAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid, kayttooikeusAnomus) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    henkiloOid,
    kayttooikeusAnomus,
});
const errorAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    henkiloOid,
});

export const fetchAllKayttooikeusAnomusForHenkilo = (henkiloOid: string) => (dispatch: AppDispatch) => {
    dispatch(requestAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid));
    const url = urls.url('kayttooikeus-service.henkilo.anomus-list', henkiloOid, { activeOnly: true });
    http.get<[{ anomus: { organisaatioOid: string } }]>(url)
        .then((kayttooikeusAnomus) =>
            dispatch(receiveAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid, kayttooikeusAnomus))
        )
        .catch(() => dispatch(errorAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid)));
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

const createKayttooikeusanomusRequest = () => ({
    type: CREATE_KAYTTOOIKEUSANOMUS_REQUEST,
});
const createKayttooikeusanomusSuccess = (data) => ({
    type: CREATE_KAYTTOOIKEUSANOMUS_SUCCESS,
    data,
});
const createKayttooikeusanomusFailure = (error) => ({
    type: CREATE_KAYTTOOIKEUSANOMUS_FAILURE,
    error,
});

export const createKayttooikeusanomus = (anomusData: KayttooikeusAnomus) => async (dispatch: AppDispatch) => {
    dispatch(createKayttooikeusanomusRequest());
    const url = urls.url('kayttooikeus-service.henkilo.uusi.kayttooikeusanomus', anomusData.anojaOid);
    try {
        const anomusId = await http.post(url, anomusData);
        dispatch(createKayttooikeusanomusSuccess(anomusId));
    } catch (error) {
        dispatch(createKayttooikeusanomusFailure(error));
        throw error;
    }
};

// Fetch kayttooikeusryhma by id
const fetchKayttooikeusryhmaByIdrequest = () => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_BY_ID_REQUEST,
});
const fetchKayttooikeusryhmaByIdSuccess = (payload) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_BY_ID_SUCCESS,
    payload,
});
const fetchKayttooikeusryhmaByIdFailure = (error) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_BY_ID_FAILURE,
    error,
});

export const fetchKayttooikeusryhmaById = (id) => async (dispatch: AppDispatch) => {
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id', id, {
        passiiviset: true,
    });
    dispatch(fetchKayttooikeusryhmaByIdrequest());
    try {
        const data = await http.get(url);
        dispatch(fetchKayttooikeusryhmaByIdSuccess(data));
    } catch (error) {
        dispatch(fetchKayttooikeusryhmaByIdFailure(error));
        throw error;
    }
};

// Fetch kayttooikeusryhmaslaves for kayttooikeusryhma
const fetchKayttooikeusryhmaSlavesRequest = () => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_SLAVES_REQUEST,
});
const fetchKayttooikeusryhmaSlavesSuccess = (payload) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_SLAVES_SUCCESS,
    payload,
});
const fetchKayttooikeusryhmaSlavesFailure = (error) => ({
    type: FETCH_KAYTTOOIKEUSRYHMA_SLAVES_FAILURE,
    error,
});

export const fetchKayttooikeusryhmaSlaves = (id) => async (dispatch: AppDispatch) => {
    dispatch(fetchKayttooikeusryhmaSlavesRequest());
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.slaves', id);
    try {
        const payload = await http.get(url);
        dispatch(fetchKayttooikeusryhmaSlavesSuccess(payload));
    } catch (error) {
        dispatch(fetchKayttooikeusryhmaSlavesFailure(error));
        throw error;
    }
};
