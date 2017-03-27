import {FETCH_L10N_REQUEST, FETCH_L10N_SUCCESS, FETCH_LOCALISATION_REQUEST, FETCH_LOCALISATION_SUCCESS} from './actiontypes';
import {http} from "../http";
import {urls} from 'oph-urls-js';

const requestL10n = () => ({type: FETCH_L10N_REQUEST});
const receivedL10n = (json) => ({type: FETCH_L10N_SUCCESS, data: json});
const requestLocalisation = () => ({type: FETCH_LOCALISATION_REQUEST});
const receiveLocalisation = (json) => ({type: FETCH_LOCALISATION_SUCCESS, data: json});
export const fetchL10n = () => (dispatch, getState) => {
    dispatch(requestL10n());
    http.get(urls.url('henkilo-ui.l10n')).then(json => dispatch(receivedL10n(json)));
    dispatch(requestLocalisation());
    const localisationBaseUrl = urls().url('lokalisointi.localisation', {category: "kayttooikeus"});
    console.log('localisointi', localisationBaseUrl);
    http.get(localisationBaseUrl )
        .then(json => dispatch(receiveLocalisation(json)));
};