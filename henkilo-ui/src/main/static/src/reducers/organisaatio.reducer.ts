import {
    FETCH_ORGANISATIONS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_REQUEST,
    FETCH_ALL_ORGANISAATIOS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_FAILURE,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE,
    FETCH_ORGANISATION_NAMES,
} from '../actions/actiontypes';

import StaticUtils from '../components/common/StaticUtils';
import { Organisaatio, OrganisaatioWithChildren } from '../types/domain/organisaatio/organisaatio.types';

import type { Asiointikieli } from '../types/domain/kayttooikeus/Kutsu.types';

export type OrganisaatioCache = {
    [key: string]: Organisaatio;
};

export type OrganisaatioNameLookup = Record<string, Record<Asiointikieli, string>>;

export type OrganisaatioState = {
    organisaatioLoading: boolean;
    organisaatioLoaded: boolean;
    cached: OrganisaatioCache;
    organisaatioHierarkiaLoading: boolean;
    organisaatioHierarkia?: OrganisaatioWithChildren;
    names: OrganisaatioNameLookup;
};

const initialState = {
    organisaatioLoading: false,
    organisaatioLoaded: false,
    cached: {},
    organisaatioHierarkiaLoading: false,
    names: {},
};

export const organisaatio = (state: OrganisaatioState = initialState, action: any): OrganisaatioState => {
    switch (action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return { ...state, organisaatioLoading: true };
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return {
                ...state,
                organisaatioLoading: false,
                organisaatioLoaded: true,
            };
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST:
            return { ...state, organisaatioHierarkiaLoading: true };
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS:
            return {
                ...state,
                organisaatioHierarkia: action.root,
                organisaatioHierarkiaLoading: false,
            };
        case FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE:
            return { ...state, organisaatioHierarkiaLoading: false };
        case FETCH_ALL_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, {
                organisaatioLoading: false,
                organisaatiot: initialState,
            });
        case FETCH_ORGANISATIONS_SUCCESS: {
            const uncachedOrganisaatios = action.organisations
                .filter((organisaatio) => Object.keys(state.cached).indexOf(organisaatio.oid) === -1)
                .map((organisaatio) => ({ [organisaatio.oid]: organisaatio }))
                .reduce(StaticUtils.reduceListToObject, {});
            return Object.assign({}, state, {
                cached: { ...state.cached, ...uncachedOrganisaatios },
            });
        }
        case FETCH_ORGANISATION_NAMES:
            return { ...state, names: action.payload };
        default:
            return state;
    }
};
