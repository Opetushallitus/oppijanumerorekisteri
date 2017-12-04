// @flow
import {FETCH_LOCALISATIONS_REQUEST, FETCH_LOCALISATIONS_SUCCESS} from './actiontypes';
import {http} from "../http";
import {urls} from 'oph-urls-js';

const requestAllLocalisations = () => ({type: FETCH_LOCALISATIONS_REQUEST});
const receiveAllLocalisations = (payload: Array<any>) => ({
    type: FETCH_LOCALISATIONS_SUCCESS,
    henkiloUiLocalisations: payload[0],
    lokalisointiPalveluLocalisations: payload[1]
});

export const fetchL10n = () => async (dispatch: any) => {
    dispatch(requestAllLocalisations());
    try {
        const henkiloUiLocalisations = http.get(urls.url('henkilo-ui.l10n'));
        const localisationPalveluLocalisations = http.get(urls().url('lokalisointi.localisation', {category: "henkilo-ui"}));
        const result = await Promise.all([henkiloUiLocalisations, localisationPalveluLocalisations]);
        dispatch(receiveAllLocalisations(result));
    } catch (error) {
        throw error;
    }
};
