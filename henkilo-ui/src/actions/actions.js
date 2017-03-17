import { INCREMENT, DECREMENT, CHANGE, DELETE_KUTSU_SUCCESS, DELETE_KUTSU_REQUEST, FETCH_KUTSU_REQUEST,
    FETCH_KUTSU_SUCCESS, FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS, FETCH_L10N_REQUEST,
    FETCH_L10N_SUCCESS
} from './actiontypes';
import {http} from "../http";
import 'isomorphic-fetch'


export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
export const change = (count) => ({type: CHANGE, count});

const requestFrontProperties = () => ({type: FETCH_FRONTPROPERTIES_REQUEST});
const receivedFrontProperties = (json) => ({
    type: FETCH_FRONTPROPERTIES_SUCCESS,
    properties: json,
    receivedAt: Date.now()
});
export const fetchFrontProperties = () => (dispatch) => {
    dispatch(requestFrontProperties());
    http.get('/kayttooikeus-service/config/frontProperties')
        .then(json => {dispatch(receivedFrontProperties(json))});
};

const requestL10n = () => ({type: FETCH_L10N_REQUEST});
const receivedL10n = (json) => ({type: FETCH_L10N_SUCCESS, data: json});
export const fetchL10n = () => (dispatch) => {
    dispatch(requestL10n());
    http.get('/kayttooikeus-service/l10n').then(json => dispatch(receivedL10n(json)));
};

const requestDeleteKutsu = (id) => ({type: DELETE_KUTSU_REQUEST, id});
const receiveDeleteKutsu = (id, json) => ({type: DELETE_KUTSU_SUCCESS, id, receivedAt: Date.now()});
export const deleteKutsu = (id) => (dispatch => {
    dispatch(requestDeleteKutsu(id));
    const url = '/kayttooikeus-service/kutsu/' + id;
    http.delete(url).then(json => dispatch(receiveDeleteKutsu(id, json)));
});

const requestKutsus = () => ({type: FETCH_KUTSU_REQUEST});
const receiveKutsus = (json) => ({type: FETCH_KUTSU_SUCCESS, kutsuList: json, receivedAt: Date.now()});
export const fetchKutsus = (sortBy, direction) => (dispatch => {
    dispatch(requestKutsus());
    const url = '/kayttooikeus-service/kutsu' + (sortBy && direction ? '?sortBy=' + sortBy + '&direction=' + direction : '');
    http.get(url).then(json => {dispatch(receiveKutsus(json))});
}) ;

