import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS
} from "./actiontypes";

const henkilohakuRequest = (filters) => ({type: HENKILOHAKU_REQUEST, filters});
const henkilohakuSuccess = (data, noClearOldData) => ({type: HENKILOHAKU_SUCCESS, data, noClearOldData,});
const henkilohakuFailure = error => ({type: HENKILOHAKU_FAILURE, error});

export const henkilohaku = (payload, queryParams, noClearOldData) => (dispatch) => {
    dispatch(henkilohakuRequest(payload));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohaku', queryParams ? queryParams : {});
    http.post(url, payload)
        .then(data => dispatch(henkilohakuSuccess(data, noClearOldData)))
        .catch(error => dispatch(henkilohakuFailure(error)));
};

export const updateFilters = filters => dispatch => dispatch({type: UPDATE_HENKILOHAKU_FILTERS, filters});
