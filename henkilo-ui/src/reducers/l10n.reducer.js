import R from 'ramda'
import {FETCH_L10N_SUCCESS, FETCH_L10N_REQUEST, FETCH_LOCALISATION_REQUEST,
    FETCH_LOCALISATION_SUCCESS} from '../actions/actiontypes';

const mapLocalisationsToState = (state, l10nData, localisationData) => {
    const byLocale = {...l10nData};
    localisationData = localisationData || {};
    R.forEach(row => (byLocale[row.locale] || (byLocale[row.locale] = {}))[row.key.toUpperCase()] = row.value, localisationData);
    return byLocale;
};

export const l10n = (state = {l10nInitialized: false, localisationsInitialized: false, localisations: []}, action) => {
    switch (action.type) {
        case FETCH_L10N_REQUEST:
            return Object.assign({}, state, {l10nInitialized: false});
        case FETCH_LOCALISATION_REQUEST:
            return Object.assign({}, state, {localisationsInitialized: false});
        case FETCH_L10N_SUCCESS:
            if(!state.localisationsInitialized) {
                return Object.assign({}, state, {l10nInitialized: true, localisations: action.data});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisationsToState(state, action.data, state.localisations),
                l10nInitialized: true,
            });
        case FETCH_LOCALISATION_SUCCESS:
            if(!state.l10nInitialized) {
                return Object.assign({}, state, {localisationsInitialized: true, localisations: action.data});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisationsToState(state, state.localisations, action.data),
                localisationsInitialized: true,
            });
        default:
            return state;
    }
};

