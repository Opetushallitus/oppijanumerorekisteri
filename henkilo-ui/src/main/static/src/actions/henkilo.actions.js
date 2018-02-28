import {http} from "../http";
import {urls} from 'oph-urls-js';
import {
    DELETE_HENKILOORGS_FAILURE,
    DELETE_HENKILOORGS_REQUEST, DELETE_HENKILOORGS_SUCCESS,
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILO_FAILURE, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    PASSIVOI_HENKILO_FAILURE, PASSIVOI_HENKILO_REQUEST, PASSIVOI_HENKILO_SUCCESS,
    UPDATE_HENKILO_FAILURE, UPDATE_HENKILO_REQUEST,
    UPDATE_HENKILO_SUCCESS, UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_KAYTTAJATIETO_FAILURE, YKSILOI_HENKILO_FAILURE,
    YKSILOI_HENKILO_REQUEST,
    YKSILOI_HENKILO_SUCCESS,
    PURA_YKSILOINTI_REQUEST, PURA_YKSILOINTI_SUCCESS, PURA_YKSILOINTI_FAILURE,
    VTJ_OVERRIDE_HENKILO_REQUEST, VTJ_OVERRIDE_HENKILO_SUCCESS,
    VTJ_OVERRIDE_HENKILO_FAILURE,
    FETCH_HENKILO_DUPLICATES_REQUEST,
    FETCH_HENKILO_DUPLICATES_SUCCESS,
    FETCH_HENKILO_DUPLICATES_FAILURE,
    FETCH_HENKILO_SLAVES_REQUEST,
    FETCH_HENKILO_SLAVES_SUCCESS,
    FETCH_HENKILO_SLAVES_FAILURE,
    UPDATE_HENKILO_UNLINK_SUCCESS,
    UPDATE_HENKILO_UNLINK_REQUEST,
    UPDATE_HENKILO_UNLINK_FAILURE,
    LINK_HENKILOS_REQUEST,
    LINK_HENKILOS_SUCCESS,
    LINK_HENKILOS_FAILURE, FETCH_HENKILO_MASTER_FAILURE, FETCH_HENKILO_MASTER_SUCCESS, FETCH_HENKILO_MASTER_REQUEST,
    CLEAR_HENKILO, FETCH_HENKILO_YKSILOINTITIETO_REQUEST, FETCH_HENKILO_YKSILOINTITIETO_SUCCESS,
    FETCH_HENKILO_YKSILOINTITIETO_FAILURE, VTJ_OVERRIDE_YKSILOIMATON_HENKILO_REQUEST,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_SUCCESS, VTJ_OVERRIDE_YKSILOIMATON_HENKILO_FAILURE, FETCH_HENKILO_HAKEMUKSET
} from "./actiontypes";
import {fetchOrganisations} from "./organisaatio.actions";
import {fetchAllKayttooikeusryhmasForHenkilo} from "./kayttooikeusryhma.actions";
import {addGlobalNotification} from "./notification.actions";
import {NOTIFICATIONTYPES} from "../components/common/Notification/notificationtypes";
import {localizeWithState} from "../utilities/localisation.util";

const requestHenkilo = (oid) => ({type: FETCH_HENKILO_REQUEST, oid});
const receiveHenkilo = (json) => ({type: FETCH_HENKILO_SUCCESS, henkilo: json, receivedAt: Date.now()});
const receiveHenkiloFailure = (data) => ({type: FETCH_HENKILO_FAILURE, data});
export const fetchHenkilo = (oid) => (async dispatch => {
    dispatch(requestHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.oid', oid);
    try {
        const henkilo = await http.get(url);
        dispatch(receiveHenkilo(henkilo));
    } catch(error) {
        dispatch(receiveHenkiloFailure(error));
        throw error;
    }
});

const requestHenkiloUpdate = (oid) => ({type: UPDATE_HENKILO_REQUEST, oid});
const receiveHenkiloUpdate = (oid) => ({type: UPDATE_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
const errorHenkiloUpdate = error => ({type: UPDATE_HENKILO_FAILURE, error});
export const updateHenkiloAndRefetch = (payload, errorNotificationConfig) => (async dispatch => {
    dispatch(requestHenkiloUpdate(payload.oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo');
    try {
        const oid = await http.put(url, payload);
        dispatch(receiveHenkiloUpdate(oid));
        dispatch(fetchHenkilo(oid));
    } catch (error) {
        if(errorNotificationConfig) {
            dispatch(addGlobalNotification(errorNotificationConfig));
        }
        dispatch(errorHenkiloUpdate(error));
        throw error;
    }
});

const requestKayttajatieto = (oid) => ({type: FETCH_KAYTTAJATIETO_REQUEST, oid});
const receiveKayttajatieto = (json) => ({type: FETCH_KAYTTAJATIETO_SUCCESS, kayttajatieto: json, receivedAt: Date.now()});
const errorKayttajatieto = () => ({type: FETCH_KAYTTAJATIETO_FAILURE, kayttajatieto: {}});
export const fetchKayttajatieto = (oid) => (dispatch => {
    dispatch(requestKayttajatieto(oid));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.get(url).then(json => {dispatch(receiveKayttajatieto(json))}).catch(() => dispatch(errorKayttajatieto()));
});

const requestKayttajatietoUpdate = (kayttajatieto) => ({type: UPDATE_KAYTTAJATIETO_REQUEST, kayttajatieto});
const requestKayttajatietoUpdateSuccess = (kayttajatieto) => ({type: UPDATE_KAYTTAJATIETO_SUCCESS, kayttajatieto});
const requestKayttajatietoUpdateFailure = () => ({type: UPDATE_KAYTTAJATIETO_FAILURE});
export const updateAndRefetchKayttajatieto = (oid, username) => (async (dispatch, getState) => {
    dispatch(requestKayttajatietoUpdate(username));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    try {
        const kayttajatieto = await http.put(url, {username: username});
        dispatch(requestKayttajatietoUpdateSuccess(kayttajatieto));
        dispatch(fetchKayttajatieto(oid));
    } catch (error) {
        if(error.errorType === 'IllegalArgumentException') {
            dispatch(addGlobalNotification({
                autoClose: 10000,
                title: localizeWithState('NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS', getState()),
                type: NOTIFICATIONTYPES.ERROR,
                key: 'NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS'
            }));
        }
        dispatch(requestKayttajatietoUpdateFailure());
    }
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

export const aktivoiHenkilo = (oid) => async (dispatch, getState) => {
    try {
        const url = urls.url('oppijanumerorekisteri-service.henkilo', oid);
        // henkilö put toimii kuten patch joten ei tarvita kaikkia tietoja
        const data = { oidHenkilo: oid, passivoitu: false }
        await http.put(url, data)
        dispatch(fetchHenkilo(oid));
    } catch (error) {
        dispatch(addGlobalNotification({
            key: 'AKTIVOI_EPAONNISTUI',
            type: NOTIFICATIONTYPES.ERROR,
            title: localizeWithState('AKTIVOI_EPAONNISTUI', getState()),
            autoClose: 10000,
        }));
        throw error;
    }
};

const requestHenkiloYksilointitieto = (oid) => ({type: FETCH_HENKILO_YKSILOINTITIETO_REQUEST, oid});
const receiveHenkiloYksilointitieto = (payload) => ({type: FETCH_HENKILO_YKSILOINTITIETO_SUCCESS, payload});
const failureHenkiloYksilointitieto = (error) => ({type: FETCH_HENKILO_YKSILOINTITIETO_FAILURE, error});

export const fetchHenkiloYksilointitieto = (oid) => (async dispatch => {
    dispatch(requestHenkiloYksilointitieto);
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot', oid);
    try {
        const data = await http.get(url);
        dispatch(receiveHenkiloYksilointitieto(data));
    } catch(error) {
        dispatch(failureHenkiloYksilointitieto(error));
    }
});

const requestYksiloiHenkilo = (oid) => ({type: YKSILOI_HENKILO_REQUEST, oid});
const receiveYksiloiHenkilo = (oid) => ({type: YKSILOI_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
const errorYksiloiHenkilo = (error) => ({type: YKSILOI_HENKILO_FAILURE,
    receivedAt: Date.now(),
    buttonNotification: {position: 'yksiloi', notL10nMessage: 'YKSILOI_ERROR_TOPIC', notL10nText: 'YKSILOI_ERROR_TEXT'},});
export const yksiloiHenkilo = (oid,) => (dispatch => {
    dispatch(requestYksiloiHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksiloihetuton', oid);
    http.post(url).then(() => {
        dispatch(receiveYksiloiHenkilo(oid));
        dispatch(fetchHenkilo(oid))})
        .catch(e => dispatch(errorYksiloiHenkilo(e)));
});

const requestPuraYksilointi = (oid) => ({type: PURA_YKSILOINTI_REQUEST, oid});
const receivePuraYksilointi = (oid) => ({type: PURA_YKSILOINTI_SUCCESS, oid});
const errorPuraYksilointi = (error) => ({type: PURA_YKSILOINTI_FAILURE});
export const puraYksilointi = (oid) => async (dispatch) => {
    dispatch(requestPuraYksilointi(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksiloi.pura', oid);
    try {
        await http.post(url);
        receivePuraYksilointi(oid);
        dispatch(fetchHenkilo(oid))
    } catch (error) {
        errorPuraYksilointi(error);
        console.error(`Pura yksilointi failed for henkilo ${oid} - ${error}`);
    }
};

// Henkikön tietojen yliajo yksilöintitiedoille niille, jotka henkilöille jotka on yksilöity
const requestOverrideHenkiloVtjData = (oid) => ({type: VTJ_OVERRIDE_HENKILO_REQUEST, oid});
const receiveOverrideHenkiloVtjData = (oid) => ({type: VTJ_OVERRIDE_HENKILO_SUCCESS, oid, receivedAt: Date.now()});
const errorOverrideHenkiloVtjData = (error) => ({type: VTJ_OVERRIDE_HENKILO_FAILURE,
    receivedAt: Date.now(),
    buttonNotification: {position: 'vtjOverride', notL10nMessage: 'VTJ_OVERRIDE_ERROR_TOPIC', notL10nText: 'VTJ_OVERRIDE_ERROR_TEXT'},});
export const overrideHenkiloVtjData = (oid,) => (async dispatch => {
    dispatch(requestOverrideHenkiloVtjData(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot', oid);
    try {
        await http.put(url);
        dispatch(receiveOverrideHenkiloVtjData(oid));
    } catch(error) {
        dispatch(errorOverrideHenkiloVtjData(error));
        throw error;
    }
});


// Henkilön tietojen yliajo yksilöintitiedoilla niille henkilöille, joiden VTJ-yksilöinti on epäonnistunut
const requestOverrideYksiloimatonHenkilo = (oid) => ({type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_REQUEST, oid});
const successOverrideYksiloimatonHenkilo = (oid) => ({type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_SUCCESS, oid});
const errorOverrideYksiloimatonHenkilo = (error) => ({type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_FAILURE});
export const overrideYksiloimatonHenkiloVtjData = (oid) => (async dispatch => {
    dispatch(requestOverrideYksiloimatonHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot.yliajayksiloimaton', oid);
    try {
        await http.put(url);
        dispatch(successOverrideYksiloimatonHenkilo(oid));
    } catch(error) {
        dispatch(errorOverrideYksiloimatonHenkilo(error));
        throw error;
    }
});


const requestHenkiloOrgs = (oid) => ({type: FETCH_HENKILOORGS_REQUEST, oid});
const receiveHenkiloOrgsSuccess = (henkiloOrgs, organisations) => ({
    type: FETCH_HENKILOORGS_SUCCESS,
    henkiloOrgs: henkiloOrgs,
    organisations: organisations,
    receivedAt: Date.now()
});

// Fetch organisations for given henkilo (non hierarchical). If no oid given user current user oid.
export const fetchHenkiloOrgs = (oidHenkilo) => (dispatch, getState) => {
    oidHenkilo = oidHenkilo || getState().omattiedot.data.oid;
    dispatch(requestHenkiloOrgs(oidHenkilo));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatiohenkilos', oidHenkilo);
    return http.get(url).then(json => {
        dispatch(fetchOrganisations(json.map(orgHenkilo => orgHenkilo.organisaatioOid)))
            .then(organisationsAction => dispatch(receiveHenkiloOrgsSuccess(json, getState().organisaatio.cached)));
    });
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
            dispatch(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
        })
        .catch(() => dispatch(errorPassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg)));
};

const requestHenkiloDuplicates = (oidHenkilo) => ({type: FETCH_HENKILO_DUPLICATES_REQUEST, oidHenkilo});
const requestHenkiloDuplicatesSuccess = (master, duplicates) => ({type: FETCH_HENKILO_DUPLICATES_SUCCESS, master, duplicates});
const requestHenkiloDuplicatesFailure = () => ({type: FETCH_HENKILO_DUPLICATES_FAILURE});

export const fetchHenkiloDuplicates = (oidHenkilo) => async(dispatch, getState) => {
    dispatch(requestHenkiloDuplicates(oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.duplicates', oidHenkilo);
    try {
        const duplicates = await http.get(url);
        if(duplicates.length === 0) {
            dispatch(addGlobalNotification({
                key: 'NOTIFICATION_DUPLIKAATIT_TYHJA_LISTA',
                type: NOTIFICATIONTYPES.INFO,
                title: localizeWithState('NOTIFICATION_DUPLIKAATIT_TYHJA_LISTA', getState()),
                autoClose: 10000
            }));
        }
        dispatch(requestHenkiloDuplicatesSuccess(oidHenkilo, duplicates));
    } catch (error) {
        dispatch(requestHenkiloDuplicatesFailure());
        dispatch(addGlobalNotification({
            key: 'FETCH_DUPLICATES_FAIL',
            type: NOTIFICATIONTYPES.ERROR,
            title: localizeWithState('NOTIFICATION_DUPLIKAATIT_VIRHE', getState()),
            autoClose: 10000
        }));
        throw error;
    }
};

const requestHenkiloHakemukset = (oid) => ({type: FETCH_HENKILO_HAKEMUKSET.REQUEST, oid});
const requestHenkiloHakemuksetSuccess = (hakemukset) => ({type: FETCH_HENKILO_HAKEMUKSET.SUCCESS, hakemukset});
const requestHenkiloHakemuksetFailure = () => ({type: FETCH_HENKILO_HAKEMUKSET.FAILURE});

export const fetchHenkiloHakemukset = (oid) => async(dispatch, getState) => {
    dispatch(requestHenkiloHakemukset(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.hakemukset', oid);
    try {
        const hakemukset = await http.get(url, oid);
        dispatch(requestHenkiloHakemuksetSuccess(hakemukset));
    } catch (error) {
        dispatch(requestHenkiloHakemuksetFailure());
        dispatch(addGlobalNotification({
            key: 'HENKILOHAKEMUKSET_FAILURE',
            type: NOTIFICATIONTYPES.ERROR,
            title: localizeWithState('NOTIFICATION_HENKILO_HAKEMUKSET_VIRHE', getState()),
            autoClose: 10000
        }));
        throw error;
    }
};

const requestHenkiloSlaves = (oidHenkilo) => ({type: FETCH_HENKILO_SLAVES_REQUEST, oidHenkilo});
const requestHenkiloSlavesSuccess = (slaves) => ({type: FETCH_HENKILO_SLAVES_SUCCESS, slaves});
const requestHenkiloSlavesFailure = (oidHenkilo) => ({type: FETCH_HENKILO_SLAVES_FAILURE, oidHenkilo});

export const fetchHenkiloSlaves = (oidHenkilo) => async (dispatch) => {
    dispatch(requestHenkiloSlaves(oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.slaves', oidHenkilo);
    try {
        const henkiloSlaves = await http.get(url);
        dispatch(requestHenkiloSlavesSuccess(henkiloSlaves));
    } catch (error) {
        dispatch(requestHenkiloSlavesFailure(oidHenkilo));
        throw error;
    }
};

const requestHenkiloMaster = (oidHenkilo) => ({type: FETCH_HENKILO_MASTER_REQUEST, oidHenkilo});
const requestHenkiloMasterSuccess = (master) => ({type: FETCH_HENKILO_MASTER_SUCCESS, master});
const requestHenkiloMasterFailure = (oidHenkilo) => ({type: FETCH_HENKILO_MASTER_FAILURE, oidHenkilo});

export const fetchHenkiloMaster = (oidHenkilo) => async (dispatch) => {
    dispatch(requestHenkiloMaster(oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.master', oidHenkilo);
    try {
        const henkiloMaster = await http.get(url);
        dispatch(requestHenkiloMasterSuccess(henkiloMaster));
    } catch (error) {
        dispatch(requestHenkiloMasterFailure(oidHenkilo));
        throw error;
    }
};

const linkHenkilosRequest = (masterOid, slaveOids) => ({type: LINK_HENKILOS_REQUEST, masterOid, slaveOids});
const linkHenkilosSuccess = (slaveOids) => ({type: LINK_HENKILOS_SUCCESS, slaveOids});
const linkHenkilosFailure = () => ({type: LINK_HENKILOS_FAILURE});

export const linkHenkilos = (masterOid, slaveOids, successMessage, failMessage) => async(dispatch) => {
    dispatch(linkHenkilosRequest(masterOid, slaveOids));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.link', masterOid);
    try {
        await http.post(url, slaveOids);
        dispatch(linkHenkilosSuccess(slaveOids));
        dispatch(addGlobalNotification({
            key: 'LINKED_DUPLICATES_SUCCESS',
            type: NOTIFICATIONTYPES.SUCCESS,
            title: successMessage,
            autoClose: 10000
        }));
    } catch (error) {
        dispatch(linkHenkilosFailure());
        dispatch(addGlobalNotification({
            key: 'LINKED_DUPLICATES_FAILURE',
            type: NOTIFICATIONTYPES.ERROR,
            title: failMessage,
            autoClose: 10000
        }));
        throw error;
    }
};

const updateHenkiloUnlink = (masterOid, slaveOid) => ({type: UPDATE_HENKILO_UNLINK_REQUEST, masterOid, slaveOid});
const updateHenkiloUnlinkSuccess = (unlinkedSlaveOid) => ({ type: UPDATE_HENKILO_UNLINK_SUCCESS, unlinkedSlaveOid });
const updateHenkiloUnlinkFailure = () => ({ type: UPDATE_HENKILO_UNLINK_FAILURE });

export const unlinkHenkilo = (masterOid, slaveOid) => async(dispatch) => {
    dispatch(updateHenkiloUnlink(masterOid, slaveOid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.unlink', masterOid, slaveOid);
    try {
        await http.delete(url);
        dispatch(updateHenkiloUnlinkSuccess(slaveOid));
    } catch (error) {
        dispatch(updateHenkiloUnlinkFailure());
        throw error;
    }
};

export const clearHenkilo = () => dispatch => dispatch({type: CLEAR_HENKILO});
