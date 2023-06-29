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
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE,
    ADD_KAYTTOOIKEUS_TO_HENKILO_REQUEST,
    ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS,
    ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE,
    CREATE_KAYTTOOIKEUSANOMUS_REQUEST,
    CREATE_KAYTTOOIKEUSANOMUS_SUCCESS,
    CREATE_KAYTTOOIKEUSANOMUS_FAILURE,
    REMOVE_KAYTTOOIKEUS_REQUEST,
    REMOVE_KAYTTOOIKEUS_SUCCESS,
    REMOVE_KAYTTOOIKEUS_FAILURE,
    FETCH_GRANTABLE_REQUEST,
    FETCH_GRANTABLE_SUCCESS,
    FETCH_GRANTABLE_FAILURE,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_FAILURE,
    CLEAR_HAETTU_KAYTTOOIKEUSRYHMA,
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
import { AppDispatch, RootState } from '../store';

export type Kayttooikeus = {
    id: number;
    kayttoOikeudenTila: string;
    alkupvm: string;
    loppupvm: string;
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
export const updateHaettuKayttooikeusryhma = (
    id: number,
    kayttoOikeudenTila: string,
    alkupvm: string,
    loppupvm: string,
    oidHenkilo: { oid: string },
    hylkaysperuste: string
) => async (dispatch: AppDispatch) => {
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

export const updateHaettuKayttooikeusryhmaInAnomukset = (
    id: number,
    kayttoOikeudenTila: string,
    alkupvm: string,
    loppupvm: string,
    hylkaysperuste: string
) => async (dispatch: AppDispatch) => {
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
    } catch (error) {
        dispatch(errorHaettuKayttooikeusryhmaUpdate(id));
        throw error; // throw error to set notification in kayttooikeusanomukset
    }
};

export const clearHaettuKayttooikeusryhma = (id) => (dispatch: AppDispatch) => {
    dispatch({ type: CLEAR_HAETTU_KAYTTOOIKEUSRYHMA, id });
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

const requestAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) => ({
    type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST,
    oidHenkilo,
    oidOrganisation,
});
const receiveAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation, allowedKayttooikeus) => ({
    type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS,
    oidHenkilo,
    oidOrganisation,
    allowedKayttooikeus,
});
const errorAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) => ({
    type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE,
    oidHenkilo,
    oidOrganisation,
});
export const fetchAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) => (
    dispatch: AppDispatch
) => {
    dispatch(requestAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation));
    const url = urls.url(
        'kayttooikeus-service.kayttooikeusryhma.forHenkilo.inOrganisaatio',
        oidHenkilo,
        oidOrganisation
    );
    http.get(url)
        .then((allowedKayttooikeus) =>
            dispatch(receiveAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation, allowedKayttooikeus))
        )
        .catch(() => dispatch(errorAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation)));
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
export const addKayttooikeusToHenkilo = (henkiloOid: string, organisaatioOid: string, payload: Kayttooikeus[]) => (
    dispatch: AppDispatch
) => {
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
            dispatch<any>(getGrantablePrivileges(henkiloOid));
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

export const createKayttooikeusanomus = (anomusData) => async (dispatch: AppDispatch) => {
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

export const removePrivilege = (oidHenkilo: string, oidOrganisaatio: string, kayttooikeusryhmaId: number) => (
    dispatch: AppDispatch
) => {
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

// Get all privileges user can grant
const getGrantablePrivilegesRequest = () => ({ type: FETCH_GRANTABLE_REQUEST });
const getGrantablePrivilegesSuccess = (data) => ({
    type: FETCH_GRANTABLE_SUCCESS,
    data,
});
const getGrantablePrivilegesFailure = (error) => ({
    type: FETCH_GRANTABLE_FAILURE,
    error,
});

export const getGrantablePrivileges = (henkiloOid) => async (dispatch: AppDispatch) => {
    const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-list-grantable', henkiloOid);
    dispatch(getGrantablePrivilegesRequest());
    try {
        const data = await http.get(url);
        dispatch(getGrantablePrivilegesSuccess(data));
    } catch (error) {
        dispatch(getGrantablePrivilegesFailure(error));
        throw error;
    }
};

// All kayttooikeusryhmas
const fetchAllKayttooikeusryhmaRequest = () => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_REQUEST,
});
const fetchAllKayttooikeusryhmaSuccess = (data) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_SUCCESS,
    data,
});
const fetchAllKayttooikeusryhmaFailure = (error) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_FAILURE,
    error,
});

export const fetchAllKayttooikeusryhma = (forceFetch = false) => async (
    dispatch: AppDispatch,
    getState: () => RootState
) => {
    // Fetch data only once

    if (
        forceFetch ||
        (!getState().kayttooikeus.allKayttooikeusryhmas.length && !getState().kayttooikeus.allKayttooikeusryhmasLoading)
    ) {
        dispatch(fetchAllKayttooikeusryhmaRequest());
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.all', {
            passiiviset: true,
        });
        try {
            const data = await http.get(url);
            dispatch(fetchAllKayttooikeusryhmaSuccess(data));
        } catch (error) {
            dispatch(fetchAllKayttooikeusryhmaFailure(error));
            throw error;
        }
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
