import {
    DELETE_KUTSU_SUCCESS,
    DELETE_KUTSU_REQUEST,
    FETCH_KUTSU_REQUEST,
    FETCH_KUTSU_SUCCESS,
    CREATE_HENKILOBYTOKEN_FAILURE,
    CREATE_HENKILOBYTOKEN_SUCCESS,
    CREATE_HENKILOBYTOKEN_REQUEST,
    CLEAR_KUTSU_LIST,
    RENEW_KUTSU_REQUEST,
    RENEW_KUTSU_SUCCESS,
    RENEW_KUTSU_FAILURE,
    FETCH_KUTSU_FAILURE,
} from './actiontypes';

import { http } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { AppDispatch, RootState } from '../store';

const requestDeleteKutsu = (id) => ({ type: DELETE_KUTSU_REQUEST, id });
const receiveDeleteKutsu = (id) => ({
    type: DELETE_KUTSU_SUCCESS,
    id,
    receivedAt: Date.now(),
});
export const deleteKutsu = (id) => (dispatch: AppDispatch) => {
    dispatch(requestDeleteKutsu(id));
    const url = urls.url('kayttooikeus-service.peruutaKutsu', id);
    http.delete(url).then(() => dispatch(receiveDeleteKutsu(id)));
};

export const renewKutsu = (id) => async (dispatch: AppDispatch) => {
    dispatch({ type: RENEW_KUTSU_REQUEST, id });
    const url = urls.url('kayttooikeus-service.renewKutsu', id);
    try {
        await http.put(url);
        dispatch({ type: RENEW_KUTSU_SUCCESS, id });
    } catch (error) {
        console.error('Could not renew kutsu with id ' + id);
        dispatch({ type: RENEW_KUTSU_FAILURE, id });
        throw error;
    }
};

const requestKutsus = () => ({ type: FETCH_KUTSU_REQUEST });
const receiveKutsus = (json) => ({
    type: FETCH_KUTSU_SUCCESS,
    kutsus: json,
    receivedAt: Date.now(),
});
const requestKutsusFailure = () => ({ type: FETCH_KUTSU_FAILURE });

export const fetchKutsus = (payload, offset, amount) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(requestKutsus());
    const url = urls.url('kayttooikeus-service.kutsu', {
        ...payload,
        offset,
        amount,
    });
    try {
        const kutsus = await http.get(url);
        dispatch(receiveKutsus(kutsus));
    } catch (error) {
        dispatch(
            addGlobalNotification({
                key: 'KUTSUTUT_VIRKAILIJA_FETCHING_FAILED',
                autoClose: 10000,
                type: NOTIFICATIONTYPES.ERROR,
                title: localizeWithState('KUTSUTUT_VIRKAILIJA_FETCHING_FAILED', getState()),
            })
        );
        dispatch(requestKutsusFailure());
        throw error;
    }
};

export const clearKutsuList = () => (dispatch: AppDispatch) => dispatch({ type: CLEAR_KUTSU_LIST });

const createHenkiloByTokenRequest = () => ({
    type: CREATE_HENKILOBYTOKEN_REQUEST,
});
const createHenkiloByTokenSuccess = (authToken) => ({
    type: CREATE_HENKILOBYTOKEN_SUCCESS,
    authToken,
    receivedAt: Date.now(),
});
const createHenkiloByTokenFailure = (error) => ({
    type: CREATE_HENKILOBYTOKEN_FAILURE,
    receivedAt: Date.now(),
    error,
});
export const createHenkiloByToken = (temporaryToken, payload) => (dispatch: AppDispatch) => {
    dispatch(createHenkiloByTokenRequest());
    const url = urls.url('kayttooikeus-service.kutsu.by-token', temporaryToken);
    http.post(url, payload).then(
        (authToken) => {
            dispatch(createHenkiloByTokenSuccess(authToken));
            const casUrl = urls.url('cas.login', { authToken });
            window.location = casUrl;
        },
        (error) => dispatch(createHenkiloByTokenFailure(error))
    );
};
