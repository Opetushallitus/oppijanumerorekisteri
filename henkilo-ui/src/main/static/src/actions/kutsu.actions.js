import { DELETE_KUTSU_SUCCESS, DELETE_KUTSU_REQUEST, FETCH_KUTSU_REQUEST, FETCH_KUTSU_SUCCESS,
    KUTSU_SET_ORGANISAATIO, KUTSU_ADD_ORGANISAATIO, KUTSU_REMOVE_ORGANISAATIO, KUTSU_CLEAR_ORGANISAATIOS} from './actiontypes';
import {http} from "../http";
import {urls} from 'oph-urls-js';
import {} from './actiontypes';

const requestDeleteKutsu = (id) => ({type: DELETE_KUTSU_REQUEST, id});
const receiveDeleteKutsu = (id, json) => ({type: DELETE_KUTSU_SUCCESS, id, receivedAt: Date.now()});
export const deleteKutsu = (id) => (dispatch => {
    dispatch(requestDeleteKutsu(id));
    const url = urls.url('kayttooikeus-service.peruutaKutsu', id);
    http.delete(url).then(json => dispatch(receiveDeleteKutsu(id, json)));
});

const requestKutsus = () => ({type: FETCH_KUTSU_REQUEST});
const receiveKutsus = (json) => ({type: FETCH_KUTSU_SUCCESS, kutsuList: json, receivedAt: Date.now()});
export const fetchKutsus = (sortBy, direction) => dispatch => {
    dispatch(requestKutsus());
    const url = urls.url('kayttooikeus-service.kutsu', {sortBy: sortBy, direction: direction});
    http.get(url).then(json => {dispatch(receiveKutsus(json))});
};

export const kutsuSetOrganisaatio = (index, organisaatio) => dispatch => dispatch({type: KUTSU_SET_ORGANISAATIO, index, organisaatio});
export const kutsuAddOrganisaatio = organisaatio => dispatch => dispatch({type: KUTSU_ADD_ORGANISAATIO, organisaatio});
export const kutsuRemoveOrganisaatio = organisaatioOid => dispatch => dispatch({type: KUTSU_REMOVE_ORGANISAATIO, organisaatioOid});
export const kutsuClearOrganisaatios = () => dispatch => dispatch({type: KUTSU_CLEAR_ORGANISAATIOS});

