import { http } from '../http';
import { urls } from 'oph-urls-js';
import { FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILO_FAILURE, CLEAR_HENKILO } from './actiontypes';
import { AppDispatch } from '../store';

const requestHenkilo = (oid) => ({ type: FETCH_HENKILO_REQUEST, oid });
const receiveHenkilo = (json) => ({
    type: FETCH_HENKILO_SUCCESS,
    henkilo: json,
    receivedAt: Date.now(),
});
const receiveHenkiloFailure = (data) => ({ type: FETCH_HENKILO_FAILURE, data });
export const fetchHenkilo = (oid: string) => async (dispatch: AppDispatch) => {
    dispatch(requestHenkilo(oid));
    const url = urls.url('oppijanumerorekisteri-service.henkilo.oid', oid);
    try {
        const henkilo = await http.get(url);
        dispatch(receiveHenkilo(henkilo));
    } catch (error) {
        dispatch(receiveHenkiloFailure(error));
        throw error;
    }
};

export const clearHenkilo = () => (dispatch: AppDispatch) => dispatch({ type: CLEAR_HENKILO });
