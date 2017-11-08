import {FETCH_ORGANISATIONS_SUCCESS, FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS, FETCH_ALL_ORGANISAATIOS_FAILURE } from '../actions/actiontypes';

import StaticUtils from '../components/common/StaticUtils'

const initialState = {
    numHits: 0,
    organisaatiot: []
};

export const organisaatio = (state = {organisaatioLoading: false, organisaatiot: initialState, cached: {}}, action) => {
    switch(action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { organisaatioLoading: true, organisaatiot: initialState });
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return Object.assign({}, state, { organisaatioLoading: false, organisaatiot: action.organisaatios });
        case FETCH_ALL_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, { organisaatioLoading: false, organisaatiot: initialState });
        case FETCH_ORGANISATIONS_SUCCESS:
            const uncachedOrganisaatios = action.organisations
                .filter(organisaatio => Object.keys(state.cached).indexOf(organisaatio.oid) === -1)
                .map(organisaatio => ({[organisaatio.oid]: organisaatio}))
                .reduce(StaticUtils.reduceListToObject, {});
            return Object.assign({}, state, {cached: {...state.cached, ...uncachedOrganisaatios}});
        default:
            return state;
    }
};
