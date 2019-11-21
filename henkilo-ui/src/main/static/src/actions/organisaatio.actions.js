// @flow
import * as R from 'ramda';
import { http } from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS, FETCH_ALL_ORGANISAATIOS_FAILURE,
    FETCH_ALL_RYHMAT_REQUEST, FETCH_ALL_RYHMAT_SUCCESS, FETCH_ALL_RYHMAT_FAILURE,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST, FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE
} from './actiontypes';
import {FETCH_ORGANISATIONS_REQUEST, FETCH_ORGANISATIONS_SUCCESS} from "./actiontypes";
import type {Dispatch} from "../types/dispatch.type";
import type {OrganisaatioState} from "../reducers/organisaatio.reducer";
import type {RyhmatState} from '../reducers/ryhmat.reducer';
import type {OrganisaatioCriteria} from '../types/domain/organisaatio/organisaatio.types';

type GetState = () => {
    ryhmatState: RyhmatState,
    organisaatio: OrganisaatioState,
    locale: string,
};

const requestAllOrganisaatios = () => ({type: FETCH_ALL_ORGANISAATIOS_REQUEST});
const requestAllOrganisaatiosSuccess = (organisaatios) => ({type: FETCH_ALL_ORGANISAATIOS_SUCCESS, organisaatios,});
const requestAllOrganisaatiosFailure = (error) => ({type: FETCH_ALL_ORGANISAATIOS_FAILURE, error});

export const fetchAllOrganisaatios = (criteria?: OrganisaatioCriteria = { tyyppi: 'ORGANISAATIO', tila: ['AKTIIVINEN'] }) => async (dispatch: Dispatch, getState: GetState) => {
    // Fetch only with the first call
    if (!getState().organisaatio.organisaatioLoaded && !getState().organisaatio.organisaatioLoading) {
        const url = urls.url('kayttooikeus-service.organisaatio', criteria);
        dispatch(requestAllOrganisaatios());
        try {
            const organisaatiot = await http.get(url);
            dispatch(requestAllOrganisaatiosSuccess(organisaatiot));
            dispatch({type: FETCH_ORGANISATIONS_SUCCESS, organisations: organisaatiot});
        } catch (error) {
            dispatch(requestAllOrganisaatiosFailure(error));
            throw error;
        }
    }
};

const requestAllHierarchialOrganisaatios = () => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST});
const requestAllHierarchialOrganisaatiosSuccess = (root) => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS, root});
const requestAllHierarchialOrganisaatiosFailure = (error) => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE, error});

export const fetchAllHierarchialOrganisaatios = () => async (dispatch: Dispatch, getState: GetState) => {
    if (typeof getState().organisaatio.organisaatioHierarkia === 'undefined' && !getState().organisaatio.organisaatioHierarkiaLoading) {
        const criteria: OrganisaatioCriteria = { tyyppi: 'ORGANISAATIO', tila: ['AKTIIVINEN', 'SUUNNITELTU'] };
        const url = urls.url('kayttooikeus-service.organisaatio.root', criteria);
        dispatch(requestAllHierarchialOrganisaatios());
        try {
            const root = await http.get(url);
            dispatch(requestAllHierarchialOrganisaatiosSuccess(root));
        } catch (error) {
            dispatch(requestAllHierarchialOrganisaatiosFailure(error));
            throw error;
        }
    }
};


// ALL ORGANISAATIORYHMAT
const requestRyhmas = () => ({type: FETCH_ALL_RYHMAT_REQUEST});
const requestRyhmasSuccess = (ryhmas) => ({type: FETCH_ALL_RYHMAT_SUCCESS, ryhmas});
const requestRyhmasFailure = (error) => ({type: FETCH_ALL_RYHMAT_FAILURE, error});
export const fetchAllRyhmas = () => async (dispatch: Dispatch, getState: GetState) => {
    // Fetch only with first call
    if (getState().ryhmatState.ryhmas && !getState().ryhmatState.ryhmas.length && !getState().ryhmatState.ryhmasLoading) {
        const url = urls.url('kayttooikeus-service.organisaatio', { tyyppi: 'RYHMA' });
        dispatch(requestRyhmas());
        try {
            const ryhmas = await http.get(url);
            dispatch(requestRyhmasSuccess(ryhmas));
        } catch (error) {
            dispatch(requestRyhmasFailure(error));
            throw error;
        }
    }
};

const requestOrganisations = (oidOrganisations) => ({type: FETCH_ORGANISATIONS_REQUEST, oidOrganisations});
const receiveOrganisations = (json) => ({type: FETCH_ORGANISATIONS_SUCCESS, organisations: json, receivedAt: Date.now()});
export const fetchOrganisations = (oidOrganisations: Array<string>) => ((dispatch: Dispatch, getState: GetState) => {
    if(!oidOrganisations) {
        console.error('Can not fetch null organisations');
        return;
    }
    oidOrganisations = R.uniq(oidOrganisations);
    dispatch(requestOrganisations(oidOrganisations));
    const promises = oidOrganisations.filter(oidOrganisation => Object.keys(getState().organisaatio.cached).indexOf(oidOrganisation) === -1)
        .map(oidOrganisation => {
        const url = urls.url('kayttooikeus-service.organisaatio.by-oid', oidOrganisation);
        return http.get(url).catch(error => {
            console.log('Organisaation lataus epäonnistui', error);
            return {oid: oidOrganisation, nimi: {fi: oidOrganisation, en: oidOrganisation, sv: oidOrganisation}, tyypit: []};
        });
    });
    return Promise.all(promises.map(p => p.catch(e => e)))
        .then(json => dispatch(receiveOrganisations(json)))
        .catch(e => console.error(e));
});
