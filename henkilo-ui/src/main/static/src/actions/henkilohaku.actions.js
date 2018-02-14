// @flow

import {http} from '../http';
import {urls} from 'oph-urls-js';
import {
    CLEAR_HENKILOHAKU,
    HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS, HENKILOHAKUCOUNT_FAILURE, HENKILOHAKUCOUNT_REQUEST,
    HENKILOHAKUCOUNT_SUCCESS,
    UPDATE_HENKILOHAKU_FILTERS
} from "./actiontypes";
import type {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters
} from "../types/domain/kayttooikeus/HenkilohakuCriteria.types";
import type {HenkilohakuResult} from "../types/domain/kayttooikeus/HenkilohakuResult.types";

const henkilohakuRequest = (filters: HenkilohakuCriteria) => ({type: HENKILOHAKU_REQUEST, filters});
const henkilohakuSuccess = (data: HenkilohakuResult) => ({type: HENKILOHAKU_SUCCESS, data,});
const henkilohakuFailure = (error: any) => ({type: HENKILOHAKU_FAILURE, error});

export const henkilohaku = (payload: HenkilohakuCriteria, queryParams: HenkilohakuQueryparameters) => (dispatch: any) => {
    dispatch(henkilohakuRequest(payload));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohaku', queryParams ? queryParams : {});
    http.post(url, payload)
        .then(data => dispatch(henkilohakuSuccess(data)))
        .catch(error => dispatch(henkilohakuFailure(error)));
};

export const updateFilters = (filters: HenkilohakuCriteria) => (dispatch: any) => dispatch({type: UPDATE_HENKILOHAKU_FILTERS, filters});
export const clearHenkilohaku = () => (dispatch: any) => dispatch({type: CLEAR_HENKILOHAKU});


const henkilohakuCountRequest = (criteria: HenkilohakuCriteria) => ({type: HENKILOHAKUCOUNT_REQUEST, criteria});
const henkilohakuCountSuccess = (count: number) => ({type: HENKILOHAKUCOUNT_SUCCESS, count});
const henkilohakuCountFailure = () => ({type: HENKILOHAKUCOUNT_FAILURE});

export const henkilohakuCount = (criteria: HenkilohakuCriteria, queryParams?: HenkilohakuQueryparameters) => async (dispatch: any) => {
    dispatch(henkilohakuCountRequest(criteria));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohakucount', queryParams ? queryParams : {});
    try {
        const count: number = await http.post(url, criteria);
        dispatch(henkilohakuCountSuccess(count));
    } catch (error) {
        dispatch(henkilohakuCountFailure());
        console.error('henkilohakucount epäonnistui hakuehdoilla:', criteria, queryParams, error);
    }
};
