import {
    FETCH_ORGANISATIONS_SUCCESS, FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_FAILURE, FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS, FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE
} from '../actions/actiontypes';

import StaticUtils from '../components/common/StaticUtils'
import type {OrganisaatioHakuTulos} from "../types/domain/organisaatio/organisaatio.types";

export type OrganisaatioState = {
    organisaatioLoading: boolean,
    organisaatiot: OrganisaatioHakuTulos,
    cached: OrganisaatioCache,
    organisaatioHierarkiaLoading: boolean,
    organisaatioHierarkia: OrganisaatioHakuTulos
}

export type OrganisaatioCache = {
    [string]: Organisaatio
}

const initialState = {
    organisaatioLoading: false,
    organisaatiot: {
        numHits: 0,
        organisaatiot: []
    },
    cached: {},
    organisaatioHierarkia: {
        numHits: 0,
        organisaatiot: []
    },
    organisaatioHierarkiaLoading: false
};

export const organisaatio = (state = initialState, action) => {
    switch(action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return Object.assign({ ...state, organisaatioLoading: true });
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return Object.assign({}, state, {
                organisaatioLoading: false,
                organisaatiot: action.organisaatios,
            });
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST:
            return { ...state, organisaatioHierarkiaLoading: true};
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS:
            return { ...state, organisaatioHierarkia: action.organisaatios, organisaatioHierarkiaLoading: false};
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE:
            return { ...state, organisaatioHierarkiaLoading: false};
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

