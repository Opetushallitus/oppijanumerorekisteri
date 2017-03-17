import { INCREMENT, DECREMENT, CHANGE, DELETE_KUTSU_SUCCESS, DELETE_KUTSU_REQUEST, FETCH_KUTSU_REQUEST,
    FETCH_KUTSU_SUCCESS, FETCH_FRONTPROPERTIES_REQUEST, FETCH_FRONTPROPERTIES_SUCCESS, FETCH_L10N_REQUEST,
    FETCH_L10N_SUCCESS, FETCH_LOCALISATION_REQUEST, FETCH_LOCALISATION_SUCCESS
} from './actiontypes'
import {http} from "../http"
import {urls} from 'oph-urls-js'
import frontUrls from '../kayttooikeus-ui-virkailija-oph'

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
export const change = (count) => ({type: CHANGE, count});

const requestL10n = () => ({type: FETCH_L10N_REQUEST});
const receivedL10n = (json) => ({type: FETCH_L10N_SUCCESS, data: json});
const requestLocalisation = () => ({type: FETCH_LOCALISATION_REQUEST});
const receiveLocalisation = (json) => ({type: FETCH_LOCALISATION_SUCCESS, data: json});
const fetchL10n = () => (dispatch, getState) => {
    dispatch(requestL10n());
    http.get(urls.url('kayttooikeus-service.l10n')).then(json => dispatch(receivedL10n(json)));
    dispatch(requestLocalisation());
    const localisationBaseUrl = urls().url('lokalisointi.localisation');
    http.get(localisationBaseUrl )
        .then(json => dispatch(receiveLocalisation(json)));
};

const requestFrontProperties = () => ({type: FETCH_FRONTPROPERTIES_REQUEST});
const receivedFrontProperties = () => ({
    type: FETCH_FRONTPROPERTIES_SUCCESS,
    receivedAt: Date.now()
});
export const fetchFrontProperties = () => (dispatch) => {
    dispatch(requestFrontProperties());
    urls.addProperties(frontUrls);
    urls.load({overrides: '/kayttooikeus-service/config/frontProperties',})
        .then(() => {
            dispatch(receivedFrontProperties());
            dispatch(fetchL10n());
        });
};

const requestDeleteKutsu = (id) => ({type: DELETE_KUTSU_REQUEST, id});
const receiveDeleteKutsu = (id, json) => ({type: DELETE_KUTSU_SUCCESS, id, receivedAt: Date.now()});
export const deleteKutsu = (id) => (dispatch => {
    dispatch(requestDeleteKutsu(id));
    const url = urls.url('kayttooikeus-service.peruutaKutsu', id);
    http.delete(url).then(json => dispatch(receiveDeleteKutsu(id, json)));
});

const requestKutsus = () => ({type: FETCH_KUTSU_REQUEST});
const receiveKutsus = (json) => ({type: FETCH_KUTSU_SUCCESS, kutsuList: json, receivedAt: Date.now()});
export const fetchKutsus = (sortBy, direction) => (dispatch => {
    dispatch(requestKutsus());
    const url = urls.url('kayttooikeus-service.kutsu', {sortBy: sortBy, direction: direction});
    http.get(url).then(json => {dispatch(receiveKutsus(json))});
}) ;

