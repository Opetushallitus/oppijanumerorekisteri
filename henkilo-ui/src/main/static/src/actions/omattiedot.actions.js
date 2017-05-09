import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE
} from './actiontypes';
import {fetchHenkiloOrganisaatios} from './henkilo.actions';


const requestOmattiedot = () => ({type: FETCH_OMATTIEDOT_REQUEST});
const receiveOmattiedotSuccess = (json) => ({type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: json});
const receiveOmattiedotFailure = (error) => ({type: FETCH_OMATTIEDOT_FAILURE, error});

export const fetchOmattiedot = () => async dispatch => {
    dispatch(requestOmattiedot());
    const url = urls.url('cas.me');
    try {
        const omattiedotResponse = await http.get(url);
        const omattiedot = JSON.parse(omattiedotResponse);
        dispatch(receiveOmattiedotSuccess(omattiedot));
        return omattiedotResponse;
    } catch( error ) {
        dispatch(receiveOmattiedotFailure(error));
        console.error('Failed fetching omat tiedot', error);
    }
};

export const fetchHenkiloOrganisaatiosForCurrentUser = () => async dispatch => {
    await dispatch(fetchOmattiedot());
    await dispatch(fetchHenkiloOrganisaatios());
};

