// @flow
import {
    FETCH_ORGANISATIONS_SUCCESS, FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_FAILURE, FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS, FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE
} from '../actions/actiontypes';

import StaticUtils from '../components/common/StaticUtils'
import type {Organisaatio, OrganisaatioWithChildren} from "../types/domain/organisaatio/organisaatio.types";

export type OrganisaatioCache = {
    [string]: Organisaatio
}

export type OrganisaatioState = {
    organisaatioLoading: boolean,
    organisaatioLoaded: boolean,
    cached: OrganisaatioCache,
    organisaatioHierarkiaLoading: boolean,
    organisaatioHierarkia?: OrganisaatioWithChildren
}

const initialState = {
    organisaatioLoading: false,
    organisaatioLoaded: false,
    cached: {},
    organisaatioHierarkiaLoading: false,
};

export const organisaatio = (state: OrganisaatioState = initialState, action: any) => {
    switch(action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return { ...state, organisaatioLoading: true };
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return { ...state, organisaatioLoading: false, organisaatioLoaded: true };
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST:
            return { ...state, organisaatioHierarkiaLoading: true};
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS:
            return { ...state, organisaatioHierarkia: action.root, organisaatioHierarkiaLoading: false};
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

