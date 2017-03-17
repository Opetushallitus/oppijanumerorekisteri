import { INCREMENT, DECREMENT, CHANGE, DELETE_KUTSU_SUCCESS, DELETE_KUTSU_REQUEST, FETCH_KUTSU_REQUEST,
    FETCH_KUTSU_SUCCESS, FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS
} from './actiontypes';
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
    fetch('/kayttooikeus-service/config/frontProperties', {credentials: 'include', mode: 'cors'})
        .then(response => response.json())
        .then(json => {dispatch(receivedFrontProperties(json))});
};

const requestDeleteKutsu = (id) => ({type: DELETE_KUTSU_REQUEST, id});
const receiveDeleteKutsu = (id, json) => ({type: DELETE_KUTSU_SUCCESS, id, receivedAt: Date.now()});
export const deleteKutsu = (id) => (dispatch => {
    dispatch(requestDeleteKutsu(id));
    fetch('/kayttooikeus-service/kutsu/' + id, {method: 'DELETE', credentials: 'same-origin',
        redirect: 'follow', mode: 'no-cors'})
        .then(response => response.json())
        .then(json => dispatch(receiveDeleteKutsu(id, json)));
});

const requestKutsus = () => ({type: FETCH_KUTSU_REQUEST});
const receiveKutsus = (json) => ({type: FETCH_KUTSU_SUCCESS, kutsuList: json, receivedAt: Date.now()});
export const fetchKutsus = (sortBy, direction) => (dispatch => {
    dispatch(requestKutsus());
    fetch('/kayttooikeus-service/kutsu' + (sortBy && direction ? '?sortBy=' + sortBy + '&direction=' + direction : ''),
        {credentials: 'include', mode: 'cors'})
        .then(response => response.json())
        .then(json => {dispatch(receiveKutsus(json))});
}) ;
