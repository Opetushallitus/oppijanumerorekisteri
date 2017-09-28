import {http} from '../http';
import {urls} from 'oph-urls-js';
import R from 'ramda';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE
} from './actiontypes';

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
    } catch (error) {
        dispatch(receiveOmattiedotFailure(error));
        console.error('Failed fetching omat tiedot', error);
    }
};

const requestOmattiedotOrganisaatios = () => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST});
const receiveOmattiedotOrganisaatiosSuccess = (json) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, organisaatios: json});
const receiveOmattiedotOrganisaatiosFailure = (error) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, error});
export const fetchOmattiedotOrganisaatios = () => async (dispatch, getState) => {
    const oid = R.path(['omattiedot', 'data', 'oid'], getState());
    const omattiedotLoading = getState().omattiedot.omattiedotLoaded;
    if(!oid && !omattiedotLoading) {
        await dispatch(fetchOmattiedot());
    }
    const userOid = getState().omattiedot.data.oid;
    dispatch(requestOmattiedotOrganisaatios(userOid));
    const url = urls.url('kayttooikeus-service.henkilo.organisaatios', userOid);
    const omattiedotOrganisaatios = http.get(url)
        .then(() => {
                dispatch(receiveOmattiedotOrganisaatiosSuccess(omattiedotOrganisaatios));
            },
            (error) => {
                console.error(`Failed fetching organisaatios for current user: ${userOid} - ${error}` );
                dispatch(receiveOmattiedotOrganisaatiosFailure(error));
            });
};
