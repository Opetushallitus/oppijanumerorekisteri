import { urls } from 'oph-urls-js'
import { http } from '../http'
import {
    SET_PALVELUKAYTTAJAT_CRITERIA,
    FETCH_PALVELUKAYTTAJAT_REQUEST,
    FETCH_PALVELUKAYTTAJAT_FAILURE,
    FETCH_PALVELUKAYTTAJAT_SUCCESS,
} from './actiontypes'

export const setPalvelukayttajatCriteria = (criteria) => async dispatch => {
    dispatch({ type: SET_PALVELUKAYTTAJAT_CRITERIA, criteria });
};

export const fetchPalvelukayttajat = (criteria) => async dispatch => {
    dispatch({ type: FETCH_PALVELUKAYTTAJAT_REQUEST });
    const url = urls.url('kayttooikeus-service.palvelukayttaja', criteria);
    try {
        const data = await http.get(url);
        dispatch({ type: FETCH_PALVELUKAYTTAJAT_SUCCESS, data });
    } catch (error) {
        dispatch({ type: FETCH_PALVELUKAYTTAJAT_FAILURE });
        throw error;
    }
};
