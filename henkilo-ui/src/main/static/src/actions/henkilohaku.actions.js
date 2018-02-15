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
import {addGlobalNotification} from "./notification.actions";
import {localizeWithState} from "../utilities/localisation.util";
import {NOTIFICATIONTYPES} from "../components/common/Notification/notificationtypes";

const henkilohakuRequest = (filters: HenkilohakuCriteria) => ({type: HENKILOHAKU_REQUEST, filters});
const henkilohakuSuccess = (data: HenkilohakuResult) => ({type: HENKILOHAKU_SUCCESS, data,});
const henkilohakuFailure = (error: any) => ({type: HENKILOHAKU_FAILURE, error});

export const henkilohaku = (payload: HenkilohakuCriteria, queryParams: HenkilohakuQueryparameters) => async (dispatch: any, getState: () => any) => {
    dispatch(henkilohakuRequest(payload));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohaku', queryParams ? queryParams : {});
    try {
        const data = await http.post(url, payload);
        dispatch(henkilohakuSuccess(data));
    } catch (error) {
        dispatch(henkilohakuFailure(error));
        dispatch(addGlobalNotification({
            key: 'HENKILOHAKU_ERROR',
            title: localizeWithState('HENKILOHAKU_ERROR', getState()),
            type: NOTIFICATIONTYPES.ERROR,
            autoClose: 10000
        }));
    }
};

export const updateFilters = (filters: HenkilohakuCriteria) => (dispatch: any) => dispatch({type: UPDATE_HENKILOHAKU_FILTERS, filters});
export const clearHenkilohaku = () => (dispatch: any) => dispatch({type: CLEAR_HENKILOHAKU});


const henkilohakuCountRequest = (criteria: HenkilohakuCriteria) => ({type: HENKILOHAKUCOUNT_REQUEST, criteria});
const henkilohakuCountSuccess = (count: number) => ({type: HENKILOHAKUCOUNT_SUCCESS, count});
const henkilohakuCountFailure = () => ({type: HENKILOHAKUCOUNT_FAILURE});

export const henkilohakuCount = (criteria: HenkilohakuCriteria) => async (dispatch: any) => {
    dispatch(henkilohakuCountRequest(criteria));
    const url = urls.url('kayttooikeus-service.henkilo.henkilohakucount');
    try {
        const count: number = await http.post(url, criteria);
        dispatch(henkilohakuCountSuccess(count));
    } catch (error) {
        dispatch(henkilohakuCountFailure());
        console.error('henkilohakucount epäonnistui hakuehdoilla:', criteria, error);
    }
};
