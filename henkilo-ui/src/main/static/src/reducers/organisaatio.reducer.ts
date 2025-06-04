import {
    FETCH_ORGANISATIONS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_REQUEST,
    FETCH_ALL_ORGANISAATIOS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_FAILURE,
} from '../actions/actiontypes';
import { Organisaatio } from '../types/domain/organisaatio/organisaatio.types';
import type { Asiointikieli } from '../types/domain/kayttooikeus/Kutsu.types';
import { AnyAction } from '@reduxjs/toolkit';

export type OrganisaatioCache = {
    [key: string]: Organisaatio;
};

export type OrganisaatioNameLookup = Record<string, Record<Asiointikieli, string>>;

export type OrganisaatioState = {
    organisaatioLoading: boolean;
    organisaatioLoaded: boolean;
    cached: OrganisaatioCache;
};

const initialState = {
    organisaatioLoading: false,
    organisaatioLoaded: false,
    cached: {},
    names: {},
};

export const organisaatio = (
    state: Readonly<OrganisaatioState> = initialState,
    action: AnyAction
): OrganisaatioState => {
    switch (action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return { ...state, organisaatioLoading: true };
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return {
                ...state,
                organisaatioLoading: false,
                organisaatioLoaded: true,
            };
        case FETCH_ALL_ORGANISAATIOS_FAILURE:
            return { ...state, organisaatioLoading: false };
        case FETCH_ORGANISATIONS_SUCCESS: {
            const uncachedOrganisaatios = action.organisations
                .filter((organisaatio) => Object.keys(state.cached).indexOf(organisaatio.oid) === -1)
                .map((organisaatio) => [organisaatio.oid, organisaatio]);
            return { ...state, cached: { ...state.cached, ...Object.fromEntries(uncachedOrganisaatios) } };
        }
        default:
            return state;
    }
};
