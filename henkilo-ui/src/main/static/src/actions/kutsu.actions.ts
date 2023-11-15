import {
    CREATE_HENKILOBYTOKEN_FAILURE,
    CREATE_HENKILOBYTOKEN_SUCCESS,
    CREATE_HENKILOBYTOKEN_REQUEST,
} from './actiontypes';

import { http } from '../http';
import { urls } from 'oph-urls-js';
import { AppDispatch } from '../store';

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
