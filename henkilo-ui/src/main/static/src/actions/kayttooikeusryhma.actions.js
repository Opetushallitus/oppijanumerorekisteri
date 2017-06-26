import {http} from '../http';
import {urls} from 'oph-urls-js';
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
    CREATE_KAYTTOOIKEUSANOMUS_FAILURE, REMOVE_KAYTTOOIKEUS_REQUEST, REMOVE_KAYTTOOIKEUS_SUCCESS,
    REMOVE_KAYTTOOIKEUS_FAILURE, FETCH_GRANTABLE_REQUEST, FETCH_GRANTABLE_SUCCESS, FETCH_GRANTABLE_FAILURE
} from './actiontypes';
import {fetchOrganisations} from "./organisaatio.actions";
import {fetchHenkiloOrgs} from "./henkilo.actions";

const requestAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST, henkiloOid});
const receiveAllKayttooikeusryhmasForHenkilo = (henkiloOid, kayttooikeus) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    henkiloOid, kayttooikeus});
const errorAllKayttooikeusryhmasForHenkilo = (henkiloOid) => ({type: FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE, henkiloOid});
export const fetchAllKayttooikeusryhmasForHenkilo = henkiloOid => dispatch => {
    dispatch(requestAllKayttooikeusryhmasForHenkilo(henkiloOid));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.henkilo.oid', henkiloOid);
    http.get(url)
        .then(kayttooikeus => {
            dispatch(fetchOrganisations(kayttooikeus.map(kayttooikeus => kayttooikeus.organisaatioOid)))
                .then(() => dispatch(receiveAllKayttooikeusryhmasForHenkilo(henkiloOid, kayttooikeus)));
        })
        .catch(() => dispatch(errorAllKayttooikeusryhmasForHenkilo(henkiloOid)));
};

const requestAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    henkiloOid
});
const receiveAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid, kayttooikeusAnomus) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS,
    henkiloOid,
    kayttooikeusAnomus
});
const errorAllKayttooikeusryhmaAnomusForHenkilo = (henkiloOid) => ({
    type: FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    henkiloOid
});
export const fetchAllKayttooikeusAnomusForHenkilo = henkiloOid => dispatch => {
    dispatch(requestAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid));
    const url = urls.url('kayttooikeus-service.henkilo.anomus-list', henkiloOid, {activeOnly: true});
    http.get(url)
        .then(kayttooikeusAnomus => {
            dispatch(fetchOrganisations(kayttooikeusAnomus.map(koAnomus => koAnomus.anomus.organisaatioOid)))
                .then(() => dispatch(receiveAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid, kayttooikeusAnomus)));
        })
        .catch(() => dispatch(errorAllKayttooikeusryhmaAnomusForHenkilo(henkiloOid)));
};

const requestHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST, id, });
const receiveHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS, id, });
const errorHaettuKayttooikeusryhmaUpdate = (id) => ({ type: UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE, id });
export const updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm, oidHenkilo) => dispatch => {
    dispatch(requestHaettuKayttooikeusryhmaUpdate(id));
    const url = urls.url('kayttooikeus-service.henkilo.kaytto-oikeus-anomus');
    http.put(url, {id, kayttoOikeudenTila, alkupvm, loppupvm,})
        .then(() => {
            dispatch(receiveHaettuKayttooikeusryhmaUpdate(id));
            dispatch(fetchAllKayttooikeusAnomusForHenkilo(oidHenkilo));
            dispatch(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
        }).catch(() => dispatch(errorHaettuKayttooikeusryhmaUpdate(id)));
};



//KAYTTOOIKEUSRYHMAT FOR ORGANISAATIO
const requestOrganisaatioKayttooikeusryhmat = (organisaatioOid) => ({type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST, organisaatioOid});
const requestOrganisaatioKayttooikeusryhmatSuccess = (kayttooikeusryhmat) => ({type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS, kayttooikeusryhmat});
const requestOrganisaatioKayttooikeusryhmatFailure = (error) => ({type: FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE, error});
export const fetchOrganisaatioKayttooikeusryhmat = organisaatioOid => async dispatch => {
    dispatch(requestOrganisaatioKayttooikeusryhmat(organisaatioOid));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.organisaatio', organisaatioOid);
    try {
        const kayttooikeusryhmat = await http.get(url, organisaatioOid);
        dispatch(requestOrganisaatioKayttooikeusryhmatSuccess(kayttooikeusryhmat));
    } catch (error) {
        console.error(error);
        dispatch(requestOrganisaatioKayttooikeusryhmatFailure(error));
        throw error;
    }
};

const requestAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) =>
    ({ type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST, oidHenkilo, oidOrganisation, });
const receiveAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation, allowedKayttooikeus) =>
    ({ type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS, oidHenkilo, oidOrganisation, allowedKayttooikeus, });
const errorAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) =>
    ({ type: FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE, oidHenkilo, oidOrganisation, });
export const fetchAllowedKayttooikeusryhmasForOrganisation = (oidHenkilo, oidOrganisation) => dispatch => {
    dispatch(requestAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation));
    const url = urls.url('kayttooikeus-service.kayttooikeusryhma.forHenkilo.inOrganisaatio', oidHenkilo, oidOrganisation);
    http.get(url, oidHenkilo, oidOrganisation)
        .then((allowedKayttooikeus) =>
            dispatch(receiveAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation, allowedKayttooikeus)))
        .catch(() => dispatch(errorAllowedKayttooikeusryhmasForOrganisation(oidHenkilo, oidOrganisation)));
};

const requestAddKayttooikeusToHenkilo = () => ({type: ADD_KAYTTOOIKEUS_TO_HENKILO_REQUEST});
const receiveAddKayttooikeusToHenkilo = (organisaatioOid, ryhmaIdList) => ({type: ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS,
    organisaatioOid, ryhmaIdList,});
const errorAddKayttooikeusToHenkilo = (organisaatioOid, ryhmaIdList) => ({type: ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE,
    id: organisaatioOid + ryhmaIdList.join(''),});
export const addKayttooikeusToHenkilo = (henkiloOid, organisaatioOid, payload) => dispatch => {
    dispatch(requestAddKayttooikeusToHenkilo());
    const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-myonto', henkiloOid, organisaatioOid);
    http.put(url, payload)
        .then(() => {
            dispatch(receiveAddKayttooikeusToHenkilo(organisaatioOid, payload.map(payload => payload.id)));
            dispatch(fetchAllKayttooikeusryhmasForHenkilo(henkiloOid));
            dispatch(fetchHenkiloOrgs(henkiloOid));
        })
        .catch(() => dispatch(errorAddKayttooikeusToHenkilo(organisaatioOid, payload.map(payload => payload.id))));
};


const createKayttooikeusanomusRequest = () => ({type: CREATE_KAYTTOOIKEUSANOMUS_REQUEST});
const createKayttooikeusanomusSuccess = data => ({type: CREATE_KAYTTOOIKEUSANOMUS_SUCCESS, data});
const createKayttooikeusanomusFailure = error => ({type: CREATE_KAYTTOOIKEUSANOMUS_FAILURE, error});

export const createKayttooikeusanomus = (anomusData) => async dispatch => {
    dispatch(createKayttooikeusanomusRequest());
    const url = urls.url('kayttooikeus-service.henkilo.uusi.kayttooikeusanomus', anomusData.anojaOid);
    try {
        const anomusId = await http.post(url, anomusData);
        dispatch(createKayttooikeusanomusSuccess(anomusId));
    } catch (error) {
        dispatch(createKayttooikeusanomusFailure(error));
        console.error(`Failed creating new kayttooikeusanomus for henkilo: ${anomusData.anojaOid}`, error);
        throw error;
    }
};

// Remove käyttöoikeus from henkilo in given organisation
const removePrivilegeRequest = data => ({type: REMOVE_KAYTTOOIKEUS_REQUEST, ...data});
const removePrivilegeSuccess = data => ({type: REMOVE_KAYTTOOIKEUS_SUCCESS, ...data});
const removePrivilegeFailure = (error, data) => ({type: REMOVE_KAYTTOOIKEUS_FAILURE, error, ...data});

export const removePrivilege = (oidHenkilo, oidOrganisaatio, kayttooikeusryhmaId) => dispatch => {
    const data = {oidHenkilo, oidOrganisaatio, kayttooikeusryhmaId};
    const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-remove', oidHenkilo, oidOrganisaatio, kayttooikeusryhmaId);
    dispatch(removePrivilegeRequest(data));
    http.delete(url)
        .then(() => {
            dispatch(removePrivilegeSuccess(data));
            dispatch(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
        })
        .catch(error => dispatch(removePrivilegeFailure(error, data)));
};

// Get all privileges user can grant
const getGrantablePrivilegesRequest = () => ({type: FETCH_GRANTABLE_REQUEST});
const getGrantablePrivilegesSuccess = data => ({type: FETCH_GRANTABLE_SUCCESS, data});
const getGrantablePrivilegesFailure = (error) => ({type: FETCH_GRANTABLE_FAILURE, error});

export const getGrantablePrivileges = (henkiloOid) => dispatch => {
    const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-list-grantable', henkiloOid);
    dispatch(getGrantablePrivilegesRequest());
    http.get(url)
        .then((data) => dispatch(getGrantablePrivilegesSuccess(data)))
        .catch(error => dispatch(getGrantablePrivilegesFailure(error)));
};

