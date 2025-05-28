import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE,
    ADD_KAYTTOOIKEUS_TO_HENKILO_REQUEST,
    ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS,
    ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE,
    CREATE_KAYTTOOIKEUSANOMUS_REQUEST,
    CREATE_KAYTTOOIKEUSANOMUS_SUCCESS,
    CREATE_KAYTTOOIKEUSANOMUS_FAILURE,
    REMOVE_KAYTTOOIKEUS_REQUEST,
    REMOVE_KAYTTOOIKEUS_SUCCESS,
    REMOVE_KAYTTOOIKEUS_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_BY_ID_FAILURE,
    FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_REQUEST,
    FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_SUCCESS,
    FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_SLAVES_FAILURE,
} from './actiontypes';
import { fetchOrganisations } from './organisaatio.actions';
import { fetchHenkiloOrgs } from './henkilo.actions';
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

const requestAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    henkiloOid,
});
const receiveAllKayttooikeusryhmasForHenkilo = (henkiloOid, kayttooikeus) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    henkiloOid,
    kayttooikeus,
});
const errorAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE,
    henkiloOid,
});
export const fetchAllKayttooikeusryhmasForHenkilo = (henkiloOid?: string) => (dispatch: AppDispatch) => {
    dispatch(requestAllKayttooikeusryhmasForHenkilo(henkiloOid));
    const url = henkiloOid
        ? urls.url('kayttooikeus-service.kayttooikeusryhma.henkilo.oid', henkiloOid)
        : urls.url('kayttooikeus-service.kayttooikeusryhma.henkilo.current');
    http.get<[{ organisaatioOid: string }]>(url)
        .then((kayttooikeus) => {
            dispatch<any>(fetchOrganisations(kayttooikeus.map((ko) => ko.organisaatioOid))).then(() =>
                dispatch(receiveAllKayttooikeusryhmasForHenkilo(henkiloOid, kayttooikeus))
            );
        })
        .catch(() => dispatch(errorAllKayttooikeusryhmasForHenkilo(henkiloOid)));
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
        .then((kayttooikeusAnomus) => {
            dispatch<any>(
                fetchOrganisations(kayttooikeusAnomus.map((koAnomus) => koAnomus.anomus.organisaatioOid))
            ).then(() => dispatch(receiveAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid, kayttooikeusAnomus)));
        })
        .catch(() => dispatch(errorAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid)));
};

const requestHaettuKayttooikeusryhmaUpdate = (id) => ({
    type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST,
    id,
});
const receiveHaettuKayttooikeusryhmaUpdate = (id) => ({
    type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS,
    id,
});
const errorHaettuKayttooikeusryhmaUpdate = (id) => ({
    type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE,
    id,
});
export const updateHaettuKayttooikeusryhma =
    (
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string | undefined,
        oidHenkilo: { oid: string },
        hylkaysperuste?: string
    ) =>
    async (dispatch: AppDispatch) => {
        dispatch(requestHaettuKayttooikeusryhmaUpdate(id));
        const url = urls.url('kayttooikeus-service.henkilo.kaytto-oikeus-anomus');
        try {
            await http.put(url, {
                id,
                kayttoOikeudenTila,
                alkupvm,
                loppupvm,
                hylkaysperuste,
            });
            dispatch(receiveHaettuKayttooikeusryhmaUpdate(id));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oidHenkilo.oid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo.oid));
        } catch (error) {
            dispatch(errorHaettuKayttooikeusryhmaUpdate(id));
            throw error;
        }
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

const requestAddKayttooikeusToHenkilo = () => ({
    type: ADD_KAYTTOOIKEUS_TO_HENKILO_REQUEST,
});
const receiveAddKayttooikeusToHenkilo = (organisaatioOid, ryhmaIdList) => ({
    type: ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS,
    organisaatioOid,
    ryhmaIdList,
});
const errorAddKayttooikeusToHenkilo = (organisaatioOid, ryhmaIdList) => ({
    type: ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE,
    id: organisaatioOid + ryhmaIdList.join(''),
});
export const addKayttooikeusToHenkilo =
    (henkiloOid: string, organisaatioOid: string, payload: Kayttooikeus[]) => (dispatch: AppDispatch) => {
        dispatch(requestAddKayttooikeusToHenkilo());
        const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-myonto', henkiloOid, organisaatioOid);
        http.put(url, payload)
            .then(() => {
                dispatch(
                    receiveAddKayttooikeusToHenkilo(
                        organisaatioOid,
                        payload.map((kayttooikeus) => kayttooikeus.id)
                    )
                );
                dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(henkiloOid));
                dispatch<any>(fetchHenkiloOrgs(henkiloOid));
            })
            .catch(() =>
                dispatch(
                    errorAddKayttooikeusToHenkilo(
                        organisaatioOid,
                        payload.map((kayttooikeus) => kayttooikeus.id)
                    )
                )
            );
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

// Remove käyttöoikeus from henkilo in given organisation
const removePrivilegeRequest = (data) => ({
    type: REMOVE_KAYTTOOIKEUS_REQUEST,
    ...data,
});
const removePrivilegeSuccess = (data) => ({
    type: REMOVE_KAYTTOOIKEUS_SUCCESS,
    ...data,
});
const removePrivilegeFailure = (error, data) => ({
    type: REMOVE_KAYTTOOIKEUS_FAILURE,
    error,
    ...data,
});

export const removePrivilege =
    (oidHenkilo: string, oidOrganisaatio: string, kayttooikeusryhmaId: number) => (dispatch: AppDispatch) => {
        const data = { oidHenkilo, oidOrganisaatio, kayttooikeusryhmaId };
        const url = urls.url(
            'kayttooikeus-service.henkilo.kayttooikeus-remove',
            oidHenkilo,
            oidOrganisaatio,
            kayttooikeusryhmaId
        );
        dispatch(removePrivilegeRequest(data));
        http.delete(url)
            .then(() => {
                dispatch(removePrivilegeSuccess(data));
                dispatch<any>(fetchHenkiloOrgs(oidHenkilo));
                dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
            })
            .catch((error) => dispatch(removePrivilegeFailure(error, data)));
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

// Fetch palvelurooli by kayttooikeusryhmaId
const fetchPalveluRooliByKayttooikeusryhmaIdRequest = () => ({
    type: FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_REQUEST,
});
const fetchPalveluRooliByKayttooikeusryhmaIdSuccess = (payload) => ({
    type: FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_SUCCESS,
    payload,
});
const fetchPalveluRooliByKayttooikeusryhmaIdFailure = (error) => ({
    type: FETCH_PALVELUROOLI_BY_KAYTTOOIKEUSRYHMA_ID_FAILURE,
    error,
});

export const fetchPalveluRooliByKayttooikeusryhmaId = (id) => async (dispatch: AppDispatch) => {
    dispatch(fetchPalveluRooliByKayttooikeusryhmaIdRequest());
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.palvelurooli', id);
    try {
        const data = await http.get(url);
        dispatch(fetchPalveluRooliByKayttooikeusryhmaIdSuccess(data));
    } catch (error) {
        dispatch(fetchPalveluRooliByKayttooikeusryhmaIdFailure(error));
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
