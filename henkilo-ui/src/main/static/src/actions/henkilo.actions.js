import {http} from "../http";
import {urls} from 'oph-urls-js';
import {
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    FETCH_ORGANISATIONS_REQUEST,
    FETCH_ORGANISATIONS_SUCCESS, PASSIVOI_HENKILO_REQUEST, PASSIVOI_HENKILO_SUCCESS,
    UPDATE_HENKILO_REQUEST,
    UPDATE_HENKILO_SUCCESS, UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    YKSILOI_HENKILO_REQUEST,
    YKSILOI_HENKILO_SUCCESS
} from "./actiontypes";

const requestHenkilo = oid => ({type: FETCH_HENKILO_REQUEST, oid});
const receiveHenkilo = (json) => ({type: FETCH_HENKILO_SUCCESS, henkilo: json, receivedAt: Date.now()});
export const fetchHenkilo = (oid) => (dispatch => {
    dispatch(requestHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.oid', oid);
    http.get(url).then(json => {dispatch(receiveHenkilo(json))});
});

const requestHenkiloUpdate = oid => ({type: UPDATE_HENKILO_REQUEST, oid});
const receiveHenkiloUpdate = (oid) => ({type: UPDATE_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
export const updateHenkiloAndRefetch = (payload) => (dispatch => {
    dispatch(requestHenkiloUpdate(payload.oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo');
    http.put(url, payload).then(oid => {
        dispatch(receiveHenkiloUpdate(oid));
        dispatch(fetchHenkilo(oid));
    });
});

const requestKayttajatietoUpdate = kayttajatieto => ({type: UPDATE_KAYTTAJATIETO_REQUEST, kayttajatieto});
const receiveKayttajatietoUpdate = (kayttajatieto) => ({type: UPDATE_KAYTTAJATIETO_SUCCESS, kayttajatieto, receivedAt: Date.now()});
export const updateKayttajatieto = (oid, username) => (dispatch => {
    dispatch(requestKayttajatietoUpdate(username));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.post(url, {username: username}).then(kayttajatieto => {dispatch(receiveKayttajatietoUpdate(kayttajatieto))});
});

const requestUpdatePassword = oid => ({type: UPDATE_PASSWORD_REQUEST, oid});
const receiveUpdatePassword = (oid) => ({type: UPDATE_PASSWORD_SUCCESS, oid, receivedAt: Date.now()});
export const updatePassword = (oid, password) => (dispatch => {
    dispatch(requestUpdatePassword(oid));
    const url = urls.url('kayttooikeus-service.henkilo.password', oid);
    http.post(url, password).then(() => {dispatch(receiveUpdatePassword(oid))});
});

const requestPassivoiHenkilo = oid => ({type: PASSIVOI_HENKILO_REQUEST, oid});
const receivePassivoiHenkilo = (oid) => ({type: PASSIVOI_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
export const passivoiHenkilo = (oid) => (dispatch => {
    dispatch(requestPassivoiHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.delete', oid);
    http.delete(url).then(() => {dispatch(receivePassivoiHenkilo(oid))});
});

const requestYksiloiHenkilo = oid => ({type: YKSILOI_HENKILO_REQUEST, oid});
const receiveYksiloiHenkilo = (oid) => ({type: YKSILOI_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
export const yksiloiHenkilo = (oid,) => (dispatch => {
    dispatch(requestYksiloiHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksiloi', oid);
    http.post(url).then(() => {dispatch(receiveYksiloiHenkilo(oid))});
});


const requestKaytajatieto = oid => ({type: FETCH_KAYTTAJATIETO_REQUEST, oid});
const receiveKayttajatieto = (json) => ({type: FETCH_KAYTTAJATIETO_SUCCESS, kayttajatieto: json, receivedAt: Date.now()});
const errorKayttajatieto = () => ({type: FETCH_KAYTTAJATIETO_FAILURE, kayttajatieto: {}});
export const fetchKayttajatieto = (oid) => (dispatch => {
    dispatch(requestKaytajatieto(oid));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.get(url).then(json => {dispatch(receiveKayttajatieto(json))}).catch(() => dispatch(errorKayttajatieto()));
});

const requestOrganisations = oidOrganisations => ({type: FETCH_ORGANISATIONS_REQUEST, oidOrganisations});
const receiveOrganisations = (json) => ({type: FETCH_ORGANISATIONS_SUCCESS, organisations: json, receivedAt: Date.now()});
const fetchOrganisations = (oidOrganisations) => (dispatch => {
    dispatch(requestOrganisations(oidOrganisations));
    const promises = oidOrganisations.map(oidOrganisation => {
        const url = urls.url('organisaatio-service.organisaatio.ByOid', oidOrganisation);
        return http.get(url);
    });
    return Promise.all(promises).then(json => dispatch(receiveOrganisations(json)));
});

const requestHenkiloOrgs = oid => ({type: FETCH_HENKILOORGS_REQUEST, oid});
const receiveHenkiloOrgs = (henkiloOrgs, organisations) => ({
    type: FETCH_HENKILOORGS_SUCCESS,
    henkiloOrgs: henkiloOrgs,
    organisations: organisations,
    receivedAt: Date.now()
});
export const fetchHenkiloOrgs = (oid) => (dispatch => {
    dispatch(requestHenkiloOrgs(oid));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatiohenkilos', oid);
    http.get(url).then(json => {
        dispatch(fetchOrganisations(json.map(orgHenkilo => orgHenkilo.organisaatioOid)))
            .then(organisationsAction => dispatch(receiveHenkiloOrgs(json, organisationsAction.organisations)));
    });
});

