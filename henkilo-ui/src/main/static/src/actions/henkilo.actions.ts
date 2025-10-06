import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_HENKILO_REQUEST,
    FETCH_HENKILO_SUCCESS,
    FETCH_HENKILO_FAILURE,
    UPDATE_HENKILO_FAILURE,
    UPDATE_HENKILO_REQUEST,
    CLEAR_HENKILO,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_REQUEST,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_SUCCESS,
    VTJ_OVERRIDE_YKSILOIMATON_HENKILO_FAILURE,
    FETCH_HENKILO_HAKEMUKSET,
} from './actiontypes';
import { addGlobalNotification } from './notification.actions';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { localizeWithState } from '../utilities/localisation.util';
import { GlobalNotificationConfig } from '../types/notification.types';
import { AppDispatch, RootState } from '../store';
import { Henkilo } from '../types/domain/oppijanumerorekisteri/henkilo.types';

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
const errorHenkiloUpdate = (error) => ({ type: UPDATE_HENKILO_FAILURE, error });
export const updateHenkiloAndRefetch =
    (payload: Henkilo, errorNotificationConfig) => async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(requestHenkiloUpdate(payload.oidHenkilo));
        const url = urls.url('oppijanumerorekisteri-service.henkilo');
        try {
            const oid = await http.put<string>(url, payload);
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

export const clearHenkilo = () => (dispatch: AppDispatch) => dispatch({ type: CLEAR_HENKILO });
