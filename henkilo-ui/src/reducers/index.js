import { INCREMENT, DECREMENT, CHANGE, FETCH_KUTSU_SUCCESS, FETCH_KUTSU_REQUEST, FETCH_FRONTPROPERTIES_REQUEST,
    FETCH_FRONTPROPERTIES_SUCCESS, FETCH_L10N_SUCCESS, FETCH_L10N_REQUEST
} from '../actions/actiontypes';

import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

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

const frontProperties = (state = {initialized: false, properties: []}, action) => {
    switch (action.type) {
        case FETCH_FRONTPROPERTIES_REQUEST:
            return Object.assign({}, state, {initialized: false});
        case FETCH_FRONTPROPERTIES_SUCCESS:
            return Object.assign({}, state, {initialized: true, properties: action.properties});
        default:
            return state;
    }
};

const l10n = (state = {initialized: false, localisations: []}, action) => {
    switch (action.type) {
        case FETCH_L10N_REQUEST:
            return Object.assign({}, state, {initialized: false});
        case FETCH_L10N_SUCCESS:
            return Object.assign({}, state, {initialized: true, localisations: action.data});
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
