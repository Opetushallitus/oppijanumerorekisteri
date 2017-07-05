import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    EMPTY_HENKILOHAKU_RESULT, HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS
} from "./actiontypes";

const henkilohakuRequest = (filters) => ({type: HENKILOHAKU_REQUEST, filters});
const henkilohakuSuccess = (data) => ({type: HENKILOHAKU_SUCCESS, data,});
const henkilohakuFailure = error => ({type: HENKILOHAKU_FAILURE, error});

export const henkilohaku = (payload, queryParams) => (dispatch) => {
    dispatch(henkilohakuRequest(payload));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohaku', queryParams ? queryParams : {});
    http.post(url, payload)
        .then(data => dispatch(henkilohakuSuccess(data)))
        .catch(error => dispatch(henkilohakuFailure(error)));
};

export const updateFilters = filters => dispatch => dispatch({type: UPDATE_HENKILOHAKU_FILTERS, filters});

export const emptyHenkilohakuResult = () => dispatch => dispatch({type: EMPTY_HENKILOHAKU_RESULT,});
