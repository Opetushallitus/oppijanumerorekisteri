import { INCREMENT, DECREMENT, CHANGE, FETCH_KUTSU_SUCCESS, FETCH_KUTSU_REQUEST, FETCH_FRONTPROPERTIES_REQUEST,
    FETCH_FRONTPROPERTIES_SUCCESS, FETCH_L10N_SUCCESS, FETCH_L10N_REQUEST, FETCH_LOCALISATION_REQUEST,
    FETCH_LOCALISATION_SUCCESS
} from '../actions/actiontypes'

import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import R from 'ramda'

const testCounter = (state = 0, action) => {
    const { type } = action;
    switch(type) {
        case INCREMENT:
            return state + 1;
        case DECREMENT:
            return state - 1;
        case CHANGE:
            return action.count;
        default:
            return state;
    }
};

const kutsuList = (state = {loaded: false, result: []}, action) => {
    switch (action.type) {
        case FETCH_KUTSU_REQUEST:
            return Object.assign({}, state, {loaded: false});
        case FETCH_KUTSU_SUCCESS:
            return Object.assign({}, state, {result: action.kutsuList, loaded: true}, );
        default:
            return state;
    }
};

const frontProperties = (state = {initialized: false,}, action) => {
    switch (action.type) {
        case FETCH_FRONTPROPERTIES_REQUEST:
            return Object.assign({}, state, {initialized: false});
        case FETCH_FRONTPROPERTIES_SUCCESS:
            return Object.assign({}, state, {initialized: true});
        default:
            return state;
    }
};

const mapLocalisationsToState = (state, l10nData, localisationData) => {
    const byLocale = {...l10nData};
    localisationData = localisationData || {};
    R.forEach(row => (byLocale[row.locale] || (byLocale[row.locale] = {}))[row.key.toUpperCase()] = row.value, localisationData);
    return byLocale;
};

const l10n = (state = {l10nInitialized: false, localisationsInitialized: false, localisations: []}, action) => {
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

const rootReducer = combineReducers({
    testCounter,
    routing,
    kutsuList,
    frontProperties,
    l10n
});

export default rootReducer;
