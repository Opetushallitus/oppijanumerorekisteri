import {urls} from 'oph-urls-js';
import {http} from '../http';
import {
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
} from './actiontypes';

const fetchOppijoidenTuontiYhteenvetoRequest = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST,
});
const fetchOppijoidenTuontiYhteenvetoSuccess = (data) => ({
    type: FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS,
    data: data
});
const fetchOppijoidenTuontiYhteenvetoFailure = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE,
});
export const fetchOppijoidenTuontiYhteenveto = () => async dispatch => {
    const url = urls.url('oppijanumerorekisteri-service.oppija.yhteenveto');
    dispatch(fetchOppijoidenTuontiYhteenvetoRequest());
    try {
        const data = await http.get(url);
        dispatch(fetchOppijoidenTuontiYhteenvetoSuccess(data));
    } catch (error) {
        dispatch(fetchOppijoidenTuontiYhteenvetoFailure());
        throw error;
    }
};

const fetchOppijoidenTuontiListausRequest = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
});
const fetchOppijoidenTuontiListausSuccess = (data) => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    data: data
});
const fetchOppijoidenTuontiListausFailure = () => ({
    type: FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
});
export const fetchOppijoidenTuontiListaus = (criteria) => async dispatch => {
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
