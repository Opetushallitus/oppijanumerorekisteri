import R from 'ramda';
import { http } from '../http';
import {urls} from 'oph-urls-js';
import { FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS, FETCH_ALL_ORGANISAATIOS_FAILURE,
    FETCH_ALL_RYHMAT_REQUEST, FETCH_ALL_RYHMAT_SUCCESS, FETCH_ALL_RYHMAT_FAILURE
} from './actiontypes';
import {FETCH_ORGANISATIONS_REQUEST, FETCH_ORGANISATIONS_SUCCESS} from "./actiontypes";


const requestAllOrganisaatios = () => ({type: FETCH_ALL_ORGANISAATIOS_REQUEST});
const requestAllOrganisaatiosSuccess = (organisaatios) => ({type: FETCH_ALL_ORGANISAATIOS_SUCCESS, organisaatios});
const requestAllOrganisaatiosFailure = (error) => ({type: FETCH_ALL_ORGANISAATIOS_FAILURE, error});

export const fetchAllOrganisaatios = () => async dispatch => {
    const url = urls.url('organisaatio-service.organisaatiot', {aktiiviset: true, suunnitellut: true, lakkautetut: false});
    dispatch(requestAllOrganisaatios());
    try {
        const organisaatiot = await http.get(url);
        dispatch(requestAllOrganisaatiosSuccess(organisaatiot));
    } catch (error) {
        dispatch(requestAllOrganisaatiosFailure(error));
        console.error('Fetching organisaatios failed', error);
        throw error;
    }
};

// ALL ORGANISAATIORYHMAT
const requestRyhmas = () => ({type: FETCH_ALL_RYHMAT_REQUEST});
const requestRyhmasSuccess = (ryhmas) => ({type: FETCH_ALL_RYHMAT_SUCCESS, ryhmas});
const requestRyhmasFailure = (error) => ({type: FETCH_ALL_RYHMAT_FAILURE, error});
export const fetchAllRyhmas = () => async dispatch => {
    const url = urls.url('organisaatio-service.ryhmat');
    dispatch(requestRyhmas());
    try {
        const ryhmas = await http.get(url);
        dispatch(requestRyhmasSuccess(ryhmas));
    } catch (error) {
        dispatch(requestRyhmasFailure(error));
        console.error('Fetching ryhmas failed', error);
        throw error;
    }

};

const requestOrganisations = oidOrganisations => ({type: FETCH_ORGANISATIONS_REQUEST, oidOrganisations});
const receiveOrganisations = (json) => ({type: FETCH_ORGANISATIONS_SUCCESS, organisations: json, receivedAt: Date.now()});
export const fetchOrganisations = (oidOrganisations) => ((dispatch, getState) => {
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
