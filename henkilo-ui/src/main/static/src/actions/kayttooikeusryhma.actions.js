import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_FAILURE, FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS, FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_REQUEST, UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_SUCCESS,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
    UPDATE_HAETTU_KAYTTOOIKEUSRYHMA_FAILURE, FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS, FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE,
    ADD_KAYTTOOIKEUS_TO_HENKILO_REQUEST, ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS, ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE,
} from './actiontypes';
import {fetchOrganisations} from "./organisaatio.actions";

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
const receiveAddKayttooikeusToHenkilo = () => ({type: ADD_KAYTTOOIKEUS_TO_HENKILO_SUCCESS});
const errorAddKayttooikeusToHenkilo = () => ({type: ADD_KAYTTOOIKEUS_TO_HENKILO_FAILURE});
export const addKayttooikeusToHenkilo = (henkiloOid, organisaatioOid, payload) => dispatch => {
    dispatch(requestAddKayttooikeusToHenkilo());
    const url = urls.url('kayttooikeus-service.henkilo.kayttooikeus-myonto', henkiloOid, organisaatioOid);
    http.put(url, payload)
        .then(() => {
            dispatch(receiveAddKayttooikeusToHenkilo());
            dispatch(fetchAllKayttooikeusryhmasForHenkilo(henkiloOid));
        })
        .catch(() => dispatch(errorAddKayttooikeusToHenkilo()));
};
