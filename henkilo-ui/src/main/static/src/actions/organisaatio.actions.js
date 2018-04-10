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
import PropertySingleton from "../globals/PropertySingleton";
import type {Dispatch} from "../types/dispatch.type";
import type {OrganisaatioState} from "../reducers/organisaatio.reducer";

type GetState = () => {
    ryhmatState: {
        ryhmas: Array<{}>,
        ryhmasLoading: boolean,
    },
    organisaatio: OrganisaatioState,
    locale: string,
};

const requestAllOrganisaatios = () => ({type: FETCH_ALL_ORGANISAATIOS_REQUEST});
const requestAllOrganisaatiosSuccess = (organisaatios) => ({type: FETCH_ALL_ORGANISAATIOS_SUCCESS, organisaatios,});
const requestAllOrganisaatiosFailure = (error) => ({type: FETCH_ALL_ORGANISAATIOS_FAILURE, error});

export const fetchAllOrganisaatios = (params: any = {aktiiviset: true, suunnitellut: false, lakkautetut: false}) => async (dispatch: Dispatch, getState: GetState) => {
    // Fetch only with the first call
    if (getState().organisaatio.organisaatiot.numHits === 0 && !getState().organisaatio.organisaatioLoading) {
        const url = urls.url('organisaatio-service.organisaatiot', params);
        const rootUrl = urls.url('organisaatio-service.organisaatio.ByOid', PropertySingleton.getState().rootOrganisaatioOid);
        dispatch(requestAllOrganisaatios());
        try {
            const organisaatiot = await http.get(url);
            const rootOrganisation = await http.get(rootUrl);
            organisaatiot.numHits += 1;
            organisaatiot.organisaatiot.push(rootOrganisation);
            dispatch(requestAllOrganisaatiosSuccess(organisaatiot));
            dispatch({type: FETCH_ORGANISATIONS_SUCCESS, organisations: organisaatiot.organisaatiot});
        } catch (error) {
            dispatch(requestAllOrganisaatiosFailure(error));
            throw error;
        }
    }
};

const requestAllHierarchialOrganisaatios = () => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_REQUEST});
const requestAllHierarchialOrganisaatiosSuccess = (organisaatios) => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_SUCCESS, organisaatios});
const requestAllHierarchialOrganisaatiosFailure = (error) => ({type: FETCH_ALL_ORGANISAATIOS_HIERARCHY_FAILURE, error});

export const fetchAllHierarchialOrganisaatios = () => async (dispatch: Dispatch, getState: GetState) => {
    if (getState().organisaatio.organisaatioHierarkia.numHits === 0 && !getState().organisaatio.organisaatioHierarkiaLoading) {
        const url = urls.url('organisaatio-service.organisaatiot.hierarkia', {aktiiviset: true, suunnitellut: false, lakkautetut: false});
        const rootUrl = urls.url('organisaatio-service.organisaatio.ByOid', PropertySingleton.getState().rootOrganisaatioOid);
        dispatch(requestAllHierarchialOrganisaatios());
        try {
            const organisaatiot = await http.get(url);
            const rootOrganisation = await http.get(rootUrl);
            organisaatiot.numHits += 1;
            organisaatiot.organisaatiot.push(rootOrganisation);
            dispatch(requestAllHierarchialOrganisaatiosSuccess(organisaatiot));
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
        const url = urls.url('organisaatio-service.ryhmat');
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
        const url = urls.url('organisaatio-service.organisaatio.ByOid', oidOrganisation);
        return http.get(url).catch(error => {
            console.log('Organisaation lataus epäonnistui', error);
            return {oid: oidOrganisation, nimi: {fi: oidOrganisation, en: oidOrganisation, sv: oidOrganisation}, tyypit: []};
        });
    });
    return Promise.all(promises.map(p => p.catch(e => e)))
        .then(json => dispatch(receiveOrganisations(json)))
        .catch(e => console.error(e));
});
