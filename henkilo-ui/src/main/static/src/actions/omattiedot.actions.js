import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE
} from './actiontypes';
import {fetchHenkiloOrgs} from './henkilo.actions';

const requestOmattiedot = () => ({type: FETCH_OMATTIEDOT_REQUEST});
const receiveOmattiedotSuccess = (json) => ({type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: json});
const receiveOmattiedotFailure = (error) => ({type: FETCH_OMATTIEDOT_FAILURE, error});

export const fetchOmattiedot = () => dispatch => {
    dispatch(requestOmattiedot());
    const url = urls.url('cas.me');
    return http.get(url).then(omattiedotResponse => {
        const omattiedot = JSON.parse(omattiedotResponse);
        return dispatch(receiveOmattiedotSuccess(omattiedot));
    }, (error) => {
        dispatch(receiveOmattiedotFailure(error));
        console.error(error);
    })


};

export const fetchKutsuFormData = () => dispatch => {
    dispatch(fetchOmattiedot())
        .then( () => {
            dispatch(fetchHenkiloOrgs());
        });
};

