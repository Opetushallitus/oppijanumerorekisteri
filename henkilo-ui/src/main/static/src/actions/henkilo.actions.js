import {http} from "../http";
import {urls} from 'oph-urls-js';
import {
    DELETE_HENKILOORGS_FAILURE,
    DELETE_HENKILOORGS_REQUEST, DELETE_HENKILOORGS_SUCCESS,
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    PASSIVOI_HENKILO_FAILURE, PASSIVOI_HENKILO_REQUEST, PASSIVOI_HENKILO_SUCCESS,
    UPDATE_HENKILO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    UPDATE_HENKILO_SUCCESS, UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS, YKSILOI_HENKILO_FAILURE,
    YKSILOI_HENKILO_REQUEST,
    YKSILOI_HENKILO_SUCCESS,
    FETCH_HENKILO_ORGANISAATIOS_REQUEST,
    FETCH_HENKILO_ORGANISAATIOS_SUCCESS,
    FETCH_HENKILO_ORGANISAATIOS_FAILURE
} from "./actiontypes";
import {fetchOrganisations} from "./organisaatio.actions";

const requestHenkilo = oid => ({type: FETCH_HENKILO_REQUEST, oid});
const receiveHenkilo = (json) => ({type: FETCH_HENKILO_SUCCESS, henkilo: json, receivedAt: Date.now()});
export const fetchHenkilo = (oid) => (dispatch => {
    dispatch(requestHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.oid', oid);
    http.get(url).then(json => {dispatch(receiveHenkilo(json))});
});

const requestHenkiloUpdate = oid => ({type: UPDATE_HENKILO_REQUEST, oid});
const receiveHenkiloUpdate = (oid) => ({type: UPDATE_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
const errorHenkiloUpdate = error => ({type: UPDATE_HENKILO_FAILURE, error});
export const updateHenkiloAndRefetch = (payload) => (dispatch => {
    dispatch(requestHenkiloUpdate(payload.oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo');
    http.put(url, payload).then(oid => {
        dispatch(receiveHenkiloUpdate(oid));
        dispatch(fetchHenkilo(oid));
    }).catch(e => dispatch(errorHenkiloUpdate(e)));
});

const requestKaytajatieto = oid => ({type: FETCH_KAYTTAJATIETO_REQUEST, oid});
const receiveKayttajatieto = (json) => ({type: FETCH_KAYTTAJATIETO_SUCCESS, kayttajatieto: json, receivedAt: Date.now()});
const errorKayttajatieto = () => ({type: FETCH_KAYTTAJATIETO_FAILURE, kayttajatieto: {}});
export const fetchKayttajatieto = (oid) => (dispatch => {
    dispatch(requestKaytajatieto(oid));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.get(url).then(json => {dispatch(receiveKayttajatieto(json))}).catch(() => dispatch(errorKayttajatieto()));
});

const requestKayttajatietoUpdate = kayttajatieto => ({type: UPDATE_KAYTTAJATIETO_REQUEST, kayttajatieto});
const receiveKayttajatietoUpdate = (kayttajatieto) => ({type: UPDATE_KAYTTAJATIETO_SUCCESS, kayttajatieto, receivedAt: Date.now()});
export const updateAndRefetchKayttajatieto = (oid, username) => (dispatch => {
    dispatch(requestKayttajatietoUpdate(username));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.post(url, {username: username})
        .then(kayttajatieto => {
            dispatch(receiveKayttajatietoUpdate(kayttajatieto));
            dispatch(fetchKayttajatieto(oid));
        });
});

const requestUpdatePassword = oid => ({type: UPDATE_PASSWORD_REQUEST, oid});
const receiveUpdatePassword = (oid) => ({type: UPDATE_PASSWORD_SUCCESS, oid, receivedAt: Date.now()});
export const updatePassword = (oid, password) => (dispatch => {
    dispatch(requestUpdatePassword(oid));
    const url = urls.url('kayttooikeus-service.henkilo.password', oid);
    http.post(url, '"' + password + '"').then(() => {dispatch(receiveUpdatePassword(oid))});
});

const requestPassivoiHenkilo = (oid) => ({type: PASSIVOI_HENKILO_REQUEST, oid, });
const receivePassivoiHenkilo = () => ({type: PASSIVOI_HENKILO_SUCCESS, receivedAt: Date.now(), });
const errorPassivoiHenkilo = (e) => ({type: PASSIVOI_HENKILO_FAILURE,
    buttonNotification: {position: 'passivoi', notL10nMessage: 'PASSIVOI_ERROR_TOPIC', notL10nText: 'PASSIVOI_ERROR_TEXT'},
    receivedAt: Date.now(), });
export const passivoiHenkilo = (oid) => (dispatch => {
    dispatch(requestPassivoiHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.delete', oid);
    http.delete(url).then(() => {
        dispatch(receivePassivoiHenkilo());
        dispatch(fetchHenkilo(oid));
    }).catch(e => dispatch(errorPassivoiHenkilo(e)));
});

const requestYksiloiHenkilo = oid => ({type: YKSILOI_HENKILO_REQUEST, oid});
const receiveYksiloiHenkilo = (oid) => ({type: YKSILOI_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
const errorYksiloiHenkilo = (error) => ({type: YKSILOI_HENKILO_FAILURE,
    receivedAt: Date.now(),
    buttonNotification: {position: 'yksiloi', notL10nMessage: 'YKSILOI_ERROR_TOPIC', notL10nText: 'YKSILOI_ERROR_TEXT'},});
export const yksiloiHenkilo = (oid,) => (dispatch => {
    dispatch(requestYksiloiHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksiloi', oid);
    http.post(url).then(() => {dispatch(receiveYksiloiHenkilo(oid))}).catch(e => dispatch(errorYksiloiHenkilo(e)));
});

const requestHenkiloOrgs = oid => ({type: FETCH_HENKILOORGS_REQUEST, oid});
const receiveHenkiloOrgsSuccess = (henkiloOrgs, organisations) => ({
    type: FETCH_HENKILOORGS_SUCCESS,
    henkiloOrgs: henkiloOrgs,
    organisations: organisations,
    receivedAt: Date.now()
});
export const fetchHenkiloOrgs = oid => (dispatch, getState) => {
    oid = oid || getState().omattiedot.data.oid;
    dispatch(requestHenkiloOrgs(oid));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatiohenkilos', oid);
    return http.get(url).then(json => {
        dispatch(fetchOrganisations(json.map(orgHenkilo => orgHenkilo.organisaatioOid)))
            .then(organisationsAction => dispatch(receiveHenkiloOrgsSuccess(json, organisationsAction.organisations)));
    });
};

const requestHenkiloOrganisaatios = oid => ({type: FETCH_HENKILO_ORGANISAATIOS_REQUEST, oid});
const receiveHenkiloOrganisaatiosSuccess = (henkiloOrganisaatios) => ({
    type: FETCH_HENKILO_ORGANISAATIOS_SUCCESS,
    henkiloOrganisaatios
});
const receiveHenkiloOrganisaatioFailure = error => ({type: FETCH_HENKILO_ORGANISAATIOS_FAILURE, error});

export const fetchHenkiloOrganisaatios = (oidHenkilo) => async (dispatch, getState) => {
    oidHenkilo = oidHenkilo || getState().omattiedot.data.oid;
    dispatch(requestHenkiloOrganisaatios(oidHenkilo));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatios', oidHenkilo);
    try {
        const henkiloOrganisaatios = await http.get(url);
        return dispatch(receiveHenkiloOrganisaatiosSuccess( henkiloOrganisaatios ));
    } catch (error) {
        dispatch(receiveHenkiloOrganisaatioFailure);
        console.error(`Failed fetching organisaatios for henkilo: ${oidHenkilo}: ${error}`);
    }
};

const requestPassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({type: DELETE_HENKILOORGS_REQUEST, oidHenkilo, oidHenkiloOrg});
const receivePassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({type: DELETE_HENKILOORGS_SUCCESS, oidHenkilo, oidHenkiloOrg,
    receivedAt: Date.now()});
const errorPassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({
    type: DELETE_HENKILOORGS_FAILURE,
    oidHenkilo,
    oidHenkiloOrg,
    buttonNotification: {position: 'passivoiOrg', notL10nMessage: 'PASSIVOI_ORG_ERROR_TOPIC', notL10nText: 'PASSIVOI_ORG_ERROR_TEXT'},
    receivedAt: Date.now(),
});
export const passivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => (dispatch) => {
    dispatch(requestPassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg));
    const url = urls.url('kayttooikeus-service.organisaatiohenkilo.passivoi', oidHenkilo, oidHenkiloOrg);
    return http.delete(url)
        .then(() => {
            dispatch(receivePassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg));
            dispatch(fetchHenkiloOrgs(oidHenkilo));
        })
        .catch(() => dispatch(errorPassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg)));
};
