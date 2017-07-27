import {
    DELETE_KUTSU_SUCCESS, DELETE_KUTSU_REQUEST, FETCH_KUTSU_REQUEST, FETCH_KUTSU_SUCCESS,
    FETCH_KUTSUBYTOKEN_REQUEST, FETCH_KUTSUBYTOKEN_SUCCESS, FETCH_KUTSUBYTOKEN_FAILURE
} from './actiontypes';

import {http} from "../http";
import {urls} from 'oph-urls-js';

const requestDeleteKutsu = (id) => ({type: DELETE_KUTSU_REQUEST, id});
const receiveDeleteKutsu = (id, json) => ({type: DELETE_KUTSU_SUCCESS, id, receivedAt: Date.now()});
export const deleteKutsu = (id) => (dispatch => {
    dispatch(requestDeleteKutsu(id));
    const url = urls.url('kayttooikeus-service.peruutaKutsu', id);
    http.delete(url).then(json => dispatch(receiveDeleteKutsu(id, json)));
});

const requestKutsus = () => ({type: FETCH_KUTSU_REQUEST});
const receiveKutsus = (json) => ({type: FETCH_KUTSU_SUCCESS, kutsus: json, receivedAt: Date.now()});
export const fetchKutsus = (sortBy, direction, onlyOwnKutsus) => dispatch => {
    dispatch(requestKutsus());
    const url = urls.url('kayttooikeus-service.kutsu', {sortBy, direction, onlyOwnKutsus: !!onlyOwnKutsus});
    http.get(url).then(json => {dispatch(receiveKutsus(json))});
};

const kutsuByTokenRequest = () => ({type: FETCH_KUTSUBYTOKEN_REQUEST});
const kutsuByTokenSuccess = (kutsu) => ({type: FETCH_KUTSUBYTOKEN_SUCCESS, kutsu, receivedAt: Date.now()});
const kutsuByTokenFailure = () => ({type: FETCH_KUTSUBYTOKEN_FAILURE, receivedAt: Date.now()});
export const fetchKutsuByToken = (temporaryToken) => dispatch => {
    dispatch(kutsuByTokenRequest());
    const url = urls.url('kayttooikeus-service.kutsu.by-token', temporaryToken);
    http.get(url)
        .then(json => {dispatch(kutsuByTokenSuccess({...json, temporaryToken}))})
        .catch(() => dispatch(kutsuByTokenFailure()));
};

