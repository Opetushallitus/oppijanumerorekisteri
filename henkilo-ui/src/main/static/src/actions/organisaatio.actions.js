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
    const url = urls.url('organisaatio-service.organisaatiot',  true, true, false);
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
export const fetchOrganisations = (oidOrganisations) => (dispatch => {
    dispatch(requestOrganisations(oidOrganisations));
    const promises = oidOrganisations.map(oidOrganisation => {
        const url = urls.url('organisaatio-service.organisaatio.ByOid', oidOrganisation);
        return http.get(url);
    });
    return Promise.all(promises).then(json => dispatch(receiveOrganisations(json)));
});
