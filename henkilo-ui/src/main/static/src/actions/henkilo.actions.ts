import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    DELETE_HENKILOORGS_FAILURE,
    DELETE_HENKILOORGS_REQUEST,
    DELETE_HENKILOORGS_SUCCESS,
    FETCH_HENKILO_REQUEST,
    FETCH_HENKILO_SUCCESS,
    FETCH_HENKILO_FAILURE,
    FETCH_HENKILOORGS_REQUEST,
    FETCH_KAYTTAJA_REQUEST,
    FETCH_KAYTTAJA_SUCCESS,
    FETCH_KAYTTAJA_FAILURE,
    FETCH_HENKILOORGS_SUCCESS,
    FETCH_KAYTTAJATIETO_FAILURE,
    FETCH_KAYTTAJATIETO_REQUEST,
    FETCH_KAYTTAJATIETO_SUCCESS,
    UPDATE_HENKILO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    UPDATE_HENKILO_SUCCESS,
    UPDATE_KAYTTAJATIETO_REQUEST,
    UPDATE_KAYTTAJATIETO_SUCCESS,
    UPDATE_KAYTTAJATIETO_FAILURE,
    VTJ_OVERRIDE_HENKILO_REQUEST,
    VTJ_OVERRIDE_HENKILO_SUCCESS,
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
    FETCH_HENKILO_MASTER_FAILURE,
    FETCH_HENKILO_MASTER_SUCCESS,
    FETCH_HENKILO_MASTER_REQUEST,
    CLEAR_HENKILO,
    FETCH_HENKILO_YKSILOINTITIETO_REQUEST,
    FETCH_HENKILO_YKSILOINTITIETO_SUCCESS,
    FETCH_HENKILO_YKSILOINTITIETO_FAILURE,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_REQUEST,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_SUCCESS,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,
    POISTA_KAYTTAJATUNNUS_REQUEST,
    POISTA_KAYTTAJATUNNUS_SUCCESS,
    POISTA_KAYTTAJATUNNUS_FAILURE,
} from './actiontypes';
import { fetchOrganisations } from './organisaatio.actions';
import { fetchAllKayttooikeusryhmasForHenkilo } from './kayttooikeusryhma.actions';
import { addGlobalNotification } from './notification.actions';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { localizeWithState } from '../utilities/localisation.util';
import { GlobalNotificationConfig } from '../types/notification.types';
import { KayttajatiedotRead } from '../types/domain/kayttooikeus/KayttajatiedotRead';
import { AppDispatch, RootState } from '../store';
import { Henkilo, HenkiloOrg, LinkedHenkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';
import { OrganisaatioCache } from '../reducers/organisaatio.reducer';

const requestHenkilo = (oid) => ({ type: FETCH_HENKILO_REQUEST, oid });
const receiveHenkilo = (json) => ({
    type: FETCH_HENKILO_SUCCESS,
    henkilo: json,
    receivedAt: Date.now(),
});
const receiveHenkiloFailure = (data) => ({ type: FETCH_HENKILO_FAILURE, data });
export const fetchHenkilo = (oid: string) => async (dispatch: AppDispatch) => {
    dispatch(requestHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.oid', oid);
    try {
        const henkilo = await http.get(url);
        dispatch(receiveHenkilo(henkilo));
    } catch (error) {
        dispatch(receiveHenkiloFailure(error));
        throw error;
    }
};

const requestHenkiloUpdate = (oid) => ({ type: UPDATE_HENKILO_REQUEST, oid });
const receiveHenkiloUpdate = (oid) => ({
    type: UPDATE_HENKILO_SUCCESS,
    oid,
    receivedAt: Date.now(),
});
const errorHenkiloUpdate = (error) => ({ type: UPDATE_HENKILO_FAILURE, error });
export const updateHenkiloAndRefetch =
    (payload: Henkilo, errorNotificationConfig) => async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(requestHenkiloUpdate(payload.oidHenkilo));
        const url = urls.url('oppijanumerorekisteri-service.henkilo');
        try {
            const oid = await http.put<string>(url, payload);
            dispatch(receiveHenkiloUpdate(oid));
            dispatch<any>(fetchHenkilo(oid));
        } catch (error) {
            const L = getState().l10n.localisations[getState().locale];
            if (errorNotificationConfig) {
                const errorMessages = getUpdateHenkiloErrorMessages(error, L);
                if (errorMessages.length > 0) {
                    errorMessages.forEach((errorMessage) =>
                        dispatch(addGlobalNotification(createUpdateHenkiloErrorNotification(errorMessage)))
                    );
                } else {
                    const errorUpdateHenkiloNotification = createUpdateHenkiloErrorNotification(
                        L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE']
                    );
                    dispatch(addGlobalNotification(errorUpdateHenkiloNotification));
                }
            }
            dispatch(errorHenkiloUpdate(error));
            throw error;
        }
    };
const createUpdateHenkiloErrorNotification = (title: string): GlobalNotificationConfig => ({
    autoClose: 10000,
    type: NOTIFICATIONTYPES.ERROR,
    key: 'HENKILOUPDATEFAILED',
    title: title,
});
const getUpdateHenkiloErrorMessages = (error, L): Array<string> => {
    const errorMessages = [];
    if (error.status === 400 && error.message && error.message.indexOf('invalid.hetu') !== -1) {
        errorMessages.push(L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU']);
    }
    if (error.status === 400 && JSON.stringify(error).includes('socialsecuritynr.already.exists')) {
        errorMessages.push(L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU_KAYTOSSA']);
    }
    return errorMessages;
};

export const fetchKayttaja = (oid) => async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_KAYTTAJA_REQUEST, oid });
    const url = urls.url('kayttooikeus-service.henkilo.byOid', oid);
    try {
        const kayttaja = await http.get(url);
        dispatch({ type: FETCH_KAYTTAJA_SUCCESS, kayttaja });
    } catch (error) {
        dispatch({ type: FETCH_KAYTTAJA_FAILURE, oid });
        throw error;
    }
};

const requestKayttajatieto = (oid: string) => ({ type: FETCH_KAYTTAJATIETO_REQUEST, oid });
const receiveKayttajatieto = (kayttajatieto: KayttajatiedotRead) => ({
    type: FETCH_KAYTTAJATIETO_SUCCESS,
    kayttajatieto,
    receivedAt: Date.now(),
});
const errorKayttajatieto = () => ({
    type: FETCH_KAYTTAJATIETO_FAILURE,
    kayttajatieto: undefined,
});
export const fetchKayttajatieto = (oid: string) => (dispatch: AppDispatch) => {
    dispatch(requestKayttajatieto(oid));
    const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
    http.get<KayttajatiedotRead>(url)
        .then((json) => {
            dispatch(receiveKayttajatieto(json));
        })
        .catch(() => dispatch(errorKayttajatieto()));
};

const requestKayttajatietoUpdate = (kayttajatieto) => ({
    type: UPDATE_KAYTTAJATIETO_REQUEST,
    kayttajatieto,
});
const requestKayttajatietoUpdateSuccess = (kayttajatieto) => ({
    type: UPDATE_KAYTTAJATIETO_SUCCESS,
    kayttajatieto,
});
const requestKayttajatietoUpdateFailure = () => ({
    type: UPDATE_KAYTTAJATIETO_FAILURE,
});
export const updateAndRefetchKayttajatieto =
    (oid, username) => async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(requestKayttajatietoUpdate(username));
        const url = urls.url('kayttooikeus-service.henkilo.kayttajatieto', oid);
        try {
            const kayttajatieto = await http.put(url, { username: username });
            dispatch(requestKayttajatietoUpdateSuccess(kayttajatieto));
            dispatch<any>(fetchKayttajatieto(oid));
        } catch (error) {
            if (error.errorType === 'IllegalArgumentException') {
                dispatch(
                    addGlobalNotification({
                        autoClose: 10000,
                        title: localizeWithState('NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS', getState()),
                        type: NOTIFICATIONTYPES.ERROR,
                        key: 'NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS',
                    })
                );
            }
            dispatch(requestKayttajatietoUpdateFailure());
        }
    };

const requestPoistaKayttajatunnus = (oid) => ({
    type: POISTA_KAYTTAJATUNNUS_REQUEST,
    oid,
});
const receivePoistaKayttajatunnus = () => ({
    type: POISTA_KAYTTAJATUNNUS_SUCCESS,
    receivedAt: Date.now(),
});
const errorPoistaKayttajatunnus = () => ({
    type: POISTA_KAYTTAJATUNNUS_FAILURE,
    buttonNotification: {
        position: 'poistaKayttajatunnus',
        notL10nMessage: 'POISTA_KAYTTAJATUNNUS_ERROR_TOPIC',
        notL10nText: 'POISTA_KAYTTAJATUNNUS_ERROR_TEXT',
    },
    receivedAt: Date.now(),
});
export const poistaKayttajatunnus = (oid) => (dispatch: AppDispatch) => {
    dispatch(requestPoistaKayttajatunnus(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.poista-kayttajatunnus', oid);
    http.delete(url)
        .then(() => {
            dispatch(receivePoistaKayttajatunnus());
            dispatch<any>(fetchKayttajatieto(oid));
            dispatch<any>(fetchHenkiloOrgs(oid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oid));
            dispatch<any>(fetchHenkilo(oid));
        })
        .catch(() => dispatch(errorPoistaKayttajatunnus()));
};

const requestHenkiloYksilointitieto = (oid) => ({
    type: FETCH_HENKILO_YKSILOINTITIETO_REQUEST,
    oid,
});
const receiveHenkiloYksilointitieto = (payload) => ({
    type: FETCH_HENKILO_YKSILOINTITIETO_SUCCESS,
    payload,
});
const failureHenkiloYksilointitieto = (error) => ({
    type: FETCH_HENKILO_YKSILOINTITIETO_FAILURE,
    error,
});

export const fetchHenkiloYksilointitieto = (oid) => async (dispatch: AppDispatch) => {
    dispatch<any>(requestHenkiloYksilointitieto);
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot', oid);
    try {
        const data = await http.get(url);
        dispatch(receiveHenkiloYksilointitieto(data));
    } catch (error) {
        dispatch(failureHenkiloYksilointitieto(error));
    }
};

// Henkikön tietojen yliajo yksilöintitiedoille niille, jotka henkilöille jotka on yksilöity
const requestOverrideHenkiloVtjData = (oid) => ({
    type: VTJ_OVERRIDE_HENKILO_REQUEST,
    oid,
});
const receiveOverrideHenkiloVtjData = (oid) => ({
    type: VTJ_OVERRIDE_HENKILO_SUCCESS,
    oid,
    receivedAt: Date.now(),
});
const errorOverrideHenkiloVtjData = () => ({
    type: VTJ_OVERRIDE_HENKILO_FAILURE,
    receivedAt: Date.now(),
    buttonNotification: {
        position: 'vtjOverride',
        notL10nMessage: 'VTJ_OVERRIDE_ERROR_TOPIC',
        notL10nText: 'VTJ_OVERRIDE_ERROR_TEXT',
    },
});
export const overrideHenkiloVtjData = (oid) => async (dispatch: AppDispatch) => {
    dispatch(requestOverrideHenkiloVtjData(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot', oid);
    try {
        await http.put(url);
        dispatch(receiveOverrideHenkiloVtjData(oid));
    } catch (error) {
        dispatch(errorOverrideHenkiloVtjData());
        throw error;
    }
};

// Henkilön tietojen yliajo yksilöintitiedoilla niille henkilöille, joiden VTJ-yksilöinti on epäonnistunut
const requestOverrideYksiloimatonHenkilo = (oid) => ({
    type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_REQUEST,
    oid,
});
const successOverrideYksiloimatonHenkilo = (oid) => ({
    type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_SUCCESS,
    oid,
});
const errorOverrideYksiloimatonHenkilo = () => ({
    type: VTJ_OVERRIDE_YKSILOIMATON_HENKILO_FAILURE,
});
export const overrideYksiloimatonHenkiloVtjData = (oid) => async (dispatch: AppDispatch) => {
    dispatch(requestOverrideYksiloimatonHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.yksilointitiedot.yliajayksiloimaton', oid);
    try {
        await http.put(url);
        dispatch(successOverrideYksiloimatonHenkilo(oid));
    } catch (error) {
        dispatch(errorOverrideYksiloimatonHenkilo());
        throw error;
    }
};

const requestHenkiloOrgs = (oid) => ({ type: FETCH_HENKILOORGS_REQUEST, oid });
const receiveHenkiloOrgsSuccess = (henkiloOrgs: HenkiloOrg[], organisations: OrganisaatioCache) => ({
    type: FETCH_HENKILOORGS_SUCCESS,
    henkiloOrgs: henkiloOrgs,
    organisations: organisations,
    receivedAt: Date.now(),
});

// Fetch organisations for given henkilo (non hierarchical). If no oid given user current user oid.
export const fetchHenkiloOrgs = (oidHenkilo) => (dispatch: AppDispatch, getState: () => RootState) => {
    oidHenkilo = oidHenkilo || getState().omattiedot.data.oid;
    dispatch(requestHenkiloOrgs(oidHenkilo));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatiohenkilos', oidHenkilo);
    return http.get<HenkiloOrg[]>(url).then((json) => {
        dispatch<any>(fetchOrganisations(json.map((orgHenkilo) => orgHenkilo.organisaatioOid))).then(() =>
            dispatch(receiveHenkiloOrgsSuccess(json, getState().organisaatio.cached))
        );
    });
};

const requestPassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({
    type: DELETE_HENKILOORGS_REQUEST,
    oidHenkilo,
    oidHenkiloOrg,
});
const receivePassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({
    type: DELETE_HENKILOORGS_SUCCESS,
    oidHenkilo,
    oidHenkiloOrg,
    receivedAt: Date.now(),
});
const errorPassivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => ({
    type: DELETE_HENKILOORGS_FAILURE,
    oidHenkilo,
    oidHenkiloOrg,
    buttonNotification: {
        position: 'passivoiOrg',
        notL10nMessage: 'PASSIVOI_ORG_ERROR_TOPIC',
        notL10nText: 'PASSIVOI_ORG_ERROR_TEXT',
    },
    receivedAt: Date.now(),
});
export const passivoiHenkiloOrg = (oidHenkilo, oidHenkiloOrg) => (dispatch: AppDispatch) => {
    dispatch(requestPassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg));
    const url = urls.url('kayttooikeus-service.organisaatiohenkilo.passivoi', oidHenkilo, oidHenkiloOrg);
    return http
        .delete(url)
        .then(() => {
            dispatch(receivePassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg));
            dispatch<any>(fetchHenkiloOrgs(oidHenkilo));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
        })
        .catch(() => dispatch(errorPassivoiHenkiloOrg(oidHenkilo, oidHenkiloOrg)));
};

const requestHenkiloDuplicates = (oidHenkilo) => ({
    type: FETCH_HENKILO_DUPLICATES_REQUEST,
    oidHenkilo,
});
const requestHenkiloDuplicatesSuccess = (master, duplicates) => ({
    type: FETCH_HENKILO_DUPLICATES_SUCCESS,
    master,
    duplicates,
});
const requestHenkiloDuplicatesFailure = () => ({
    type: FETCH_HENKILO_DUPLICATES_FAILURE,
});

export const fetchHenkiloDuplicates = (oidHenkilo) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(requestHenkiloDuplicates(oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.duplicates', oidHenkilo);
    try {
        const duplicates = await http.get<[]>(url);
        if (duplicates.length === 0) {
            dispatch(
                addGlobalNotification({
                    key: 'NOTIFICATION_DUPLIKAATIT_TYHJA_LISTA',
                    type: NOTIFICATIONTYPES.INFO,
                    title: localizeWithState('NOTIFICATION_DUPLIKAATIT_TYHJA_LISTA', getState()),
                    autoClose: 10000,
                })
            );
        }
        dispatch(requestHenkiloDuplicatesSuccess(oidHenkilo, duplicates));
    } catch (error) {
        dispatch(requestHenkiloDuplicatesFailure());
        let errorMessage = localizeWithState('NOTIFICATION_DUPLIKAATIT_VIRHE', getState()) + ' ' + oidHenkilo;
        if (
            error.message?.startsWith('Failed to read response from ataru') ||
            error.message?.startsWith('Failed to fetch applications from ataru')
        ) {
            errorMessage =
                localizeWithState('NOTIFICATION_DUPLIKAATIT_HAKEMUKSET_ATARU_VIRHE', getState()) + ' ' + oidHenkilo;
        } else if (error.message?.startsWith('Failed fetching hakemuksetDto for henkilos')) {
            errorMessage =
                localizeWithState('NOTIFICATION_DUPLIKAATIT_HAKEMUKSET_HAKUAPP_VIRHE', getState()) + ' ' + oidHenkilo;
        }
        dispatch(
            addGlobalNotification({
                key: 'FETCH_DUPLICATES_FAIL',
                type: NOTIFICATIONTYPES.ERROR,
                title: errorMessage,
                autoClose: 10000,
            })
        );
        throw error;
    }
};

const requestHenkiloHakemukset = (oid) => ({
    type: FETCH_HENKILO_HAKEMUKSET.REQUEST,
    oid,
});
const requestHenkiloHakemuksetSuccess = (hakemukset) => ({
    type: FETCH_HENKILO_HAKEMUKSET.SUCCESS,
    hakemukset,
});
const requestHenkiloHakemuksetFailure = () => ({
    type: FETCH_HENKILO_HAKEMUKSET.FAILURE,
});

export const fetchHenkiloHakemukset = (oid: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(requestHenkiloHakemukset(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.hakemukset', oid);
    try {
        const hakemukset = await http.get(url);
        dispatch(requestHenkiloHakemuksetSuccess(hakemukset));
    } catch (error) {
        dispatch(requestHenkiloHakemuksetFailure());

        let errorMessage = localizeWithState('NOTIFICATION_HENKILO_HAKEMUKSET_VIRHE', getState()) + ' ' + oid;
        if (
            error.message.startsWith('Failed to read response from ataru') ||
            error.message.startsWith('Failed to fetch applications from ataru')
        ) {
            errorMessage = localizeWithState('NOTIFICATION_HENKILO_HAKEMUKSET_ATARU_VIRHE', getState()) + ' ' + oid;
        } else if (error.message.startsWith('Failed fetching hakemuksetDto for henkilos')) {
            errorMessage = localizeWithState('NOTIFICATION_HENKILO_HAKEMUKSET_HAKUAPP_VIRHE', getState()) + ' ' + oid;
        }

        dispatch(
            addGlobalNotification({
                key: 'HENKILOHAKEMUKSET_FAILURE',
                type: NOTIFICATIONTYPES.ERROR,
                title: errorMessage,
                autoClose: 10000,
            })
        );
        throw error;
    }
};

const requestHenkiloSlaves = (oidHenkilo) => ({
    type: FETCH_HENKILO_SLAVES_REQUEST,
    oidHenkilo,
});
const requestHenkiloSlavesSuccess = (slaves: LinkedHenkilo[]) => ({
    type: FETCH_HENKILO_SLAVES_SUCCESS,
    slaves,
});
const requestHenkiloSlavesFailure = (oidHenkilo) => ({
    type: FETCH_HENKILO_SLAVES_FAILURE,
    oidHenkilo,
});

export const fetchHenkiloSlaves = (oidHenkilo) => async (dispatch: AppDispatch) => {
    dispatch(requestHenkiloSlaves(oidHenkilo));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.slaves', oidHenkilo);
    try {
        const henkiloSlaves = await http.get<LinkedHenkilo[]>(url);
        dispatch(requestHenkiloSlavesSuccess(henkiloSlaves));
    } catch (error) {
        dispatch(requestHenkiloSlavesFailure(oidHenkilo));
        throw error;
    }
};

const requestHenkiloMaster = (oidHenkilo) => ({
    type: FETCH_HENKILO_MASTER_REQUEST,
    oidHenkilo,
});
const requestHenkiloMasterSuccess = (master) => ({
    type: FETCH_HENKILO_MASTER_SUCCESS,
    master,
});
const requestHenkiloMasterFailure = (oidHenkilo) => ({
    type: FETCH_HENKILO_MASTER_FAILURE,
    oidHenkilo,
});

export const fetchHenkiloMaster = (oidHenkilo: string) => async (dispatch: AppDispatch) => {
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

const updateHenkiloUnlink = (masterOid: string, slaveOid: string) => ({
    type: UPDATE_HENKILO_UNLINK_REQUEST,
    masterOid,
    slaveOid,
});
const updateHenkiloUnlinkSuccess = (unlinkedSlaveOid: string) => ({
    type: UPDATE_HENKILO_UNLINK_SUCCESS,
    unlinkedSlaveOid,
});
const updateHenkiloUnlinkFailure = () => ({ type: UPDATE_HENKILO_UNLINK_FAILURE });

export const unlinkHenkilo = (masterOid: string, slaveOid: string) => async (dispatch: AppDispatch) => {
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

export const clearHenkilo = () => (dispatch: AppDispatch) => dispatch({ type: CLEAR_HENKILO });
