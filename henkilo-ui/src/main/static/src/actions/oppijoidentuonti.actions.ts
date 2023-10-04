import { urls } from 'oph-urls-js';
import { http } from '../http';
import { AppDispatch } from '../store';
import {
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
} from './actiontypes';

const fetchOppijoidenTuontiListausRequest = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
});
const fetchOppijoidenTuontiListausSuccess = (data) => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    data: data,
});
const fetchOppijoidenTuontiListausFailure = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
});
export const fetchOppijoidenTuontiListaus = (criteria) => async (dispatch: AppDispatch) => {
    const url = urls.url('oppijanumerorekisteri-service.oppija', criteria);
    dispatch(fetchOppijoidenTuontiListausRequest());
    try {
        const data = await http.get(url);
        dispatch(fetchOppijoidenTuontiListausSuccess(data));
    } catch (error) {
        dispatch(fetchOppijoidenTuontiListausFailure());
        throw error;
    }
};
