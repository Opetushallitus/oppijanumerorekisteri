import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE
} from './actiontypes';
import {fetchHenkilo, fetchHenkiloOrganisaatios, fetchKayttajatieto, fetchHenkiloOrgs} from './henkilo.actions';


const requestOmattiedot = () => ({type: FETCH_OMATTIEDOT_REQUEST});
const receiveOmattiedotSuccess = (json) => ({type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: json});
const receiveOmattiedotFailure = (error) => ({type: FETCH_OMATTIEDOT_FAILURE, error});

export const fetchOmattiedot = () => async dispatch => {
    dispatch(requestOmattiedot());
    const url = urls.url('cas.me');
    try {
        const omattiedotResponse = await http.get(url);
        const omattiedot = JSON.parse(omattiedotResponse);
        return dispatch(receiveOmattiedotSuccess(omattiedot));
    } catch( error ) {
        dispatch(receiveOmattiedotFailure(error));
        console.error('Failed fetching omat tiedot', error);
    }
};

export const fetchKutsuFormData = () => async dispatch => {
    await dispatch(fetchOmattiedot());
    await dispatch(fetchHenkiloOrganisaatios());
};

export const fetchOmattiedotHenkiloData = () => async dispatch => {
    const data = await dispatch(fetchOmattiedot());
    const oid = data.omattiedot.oid;

    Promise.all([
        dispatch(fetchHenkilo(oid)),
        dispatch(fetchKayttajatieto(oid)),
        dispatch(fetchHenkiloOrgs(oid))
    ]).then( () => {
        // no need to react on success
    }, (error) => {
        console.error('Failed fetching user information', error);
        throw error;
    });
};

