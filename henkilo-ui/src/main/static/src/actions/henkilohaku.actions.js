// @flow

import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    CLEAR_HENKILOHAKU,
    HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS
} from "./actiontypes";
import type {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters
} from "../types/domain/kayttooikeus/HenkilohakuCriteria.types";

const henkilohakuRequest = (filters) => ({type: HENKILOHAKU_REQUEST, filters});
const henkilohakuSuccess = (data) => ({type: HENKILOHAKU_SUCCESS, data,});
const henkilohakuFailure = error => ({type: HENKILOHAKU_FAILURE, error});

export const henkilohaku = (payload: HenkilohakuCriteria, queryParams: HenkilohakuQueryparameters) => (dispatch: any) => {
    dispatch(henkilohakuRequest(payload));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohaku', queryParams ? queryParams : {});
    http.post(url, payload)
        .then(data => dispatch(henkilohakuSuccess(data)))
        .catch(error => dispatch(henkilohakuFailure(error)));
};

export const updateFilters = (filters: HenkilohakuCriteria) => (dispatch: any) => dispatch({type: UPDATE_HENKILOHAKU_FILTERS, filters});

export const clearHenkilohaku = () => (dispatch: any) => dispatch({type: CLEAR_HENKILOHAKU});
