import {
    DELETE_KUTSU_SUCCESS,
    DELETE_KUTSU_REQUEST,
    FETCH_KUTSU_REQUEST,
    FETCH_KUTSU_SUCCESS,
    FETCH_KUTSUBYTOKEN_REQUEST,
    FETCH_KUTSUBYTOKEN_SUCCESS,
    FETCH_KUTSUBYTOKEN_FAILURE,
    CREATE_HENKILOBYTOKEN_FAILURE,
    CREATE_HENKILOBYTOKEN_SUCCESS,
    CREATE_HENKILOBYTOKEN_REQUEST,
    CLEAR_KUTSU_LIST,
    RENEW_KUTSU_REQUEST,
    RENEW_KUTSU_SUCCESS,
    RENEW_KUTSU_FAILURE,
    FETCH_HENKILO_ASIOINTIKIELI_SUCCESS,
    FETCH_HENKILO_SUCCESS,
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
        dispatch<any>(
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

const kutsuByTokenRequest = () => ({ type: FETCH_KUTSUBYTOKEN_REQUEST });
const kutsuByTokenSuccess = (kutsu) => ({
    type: FETCH_KUTSUBYTOKEN_SUCCESS,
    kutsu,
    receivedAt: Date.now(),
});
const kutsuByTokenFailure = () => ({
    type: FETCH_KUTSUBYTOKEN_FAILURE,
    receivedAt: Date.now(),
});

type kutsu = {
    aikaleima: string;
    asiointikieli: string;
    etunimi: string;
    hakaIdentifier: boolean;
    id: number;
    kutsujaOid: string;
    organisaatiot: [
        {
            kayttoOikeusRyhmat: [
                {
                    id: number;
                    nimi: {
                        id: number;
                        texts: {};
                    };
                }
            ];
            nimi: {
                id: number;
                texts: {};
            };
            organisaatioOid: string;
            voimassaLoppuPvm: string;
        }
    ];
    saate: string;
    sahkoposti: string;
    sukunimi: string;
    tila: string; // should be enum
};

export const fetchKutsuByToken = (temporaryToken) => (dispatch: AppDispatch) => {
    dispatch(kutsuByTokenRequest());
    const url = urls.url('kayttooikeus-service.kutsu.by-token', temporaryToken);
    http.get<kutsu>(url)
        .then((json) => {
            dispatch(kutsuByTokenSuccess({ ...json, temporaryToken }));
            dispatch({
                type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS,
                lang: json.asiointikieli,
            });
            dispatch({
                type: FETCH_HENKILO_SUCCESS,
                henkilo: {
                    ...json,
                    etunimet: json.etunimi,
                    asiointiKieli: {
                        kieliKoodi: json.asiointikieli,
                    },
                },
            });
        })
        .catch(() => dispatch(kutsuByTokenFailure()));
};

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
