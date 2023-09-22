import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_CASME_REQUEST,
    FETCH_CASME_FAILURE,
    FETCH_CASME_SUCCESS,
    UPDATE_ANOMUSILMOITUS,
    FETCH_HENKILOHAKUORGANISAATIOT_REQUEST,
    FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS,
    FETCH_HENKILOHAKUORGANISAATIOT_FAILURE,
} from './actiontypes';
import { AppDispatch, RootState } from '../store';

const updateAnomusilmoitusState = (value: boolean) => ({
    type: UPDATE_ANOMUSILMOITUS,
    value,
});
export const updateAnomusilmoitus = (value: boolean) => (dispatch: AppDispatch) => {
    dispatch(updateAnomusilmoitusState(value));
};

// Used only to determine if user has been synced to dlap
export const fetchCasMe = () => async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_CASME_REQUEST });
    try {
        const url = urls.url('cas.me');
        await http.get(url);
        dispatch({ type: FETCH_CASME_SUCCESS });
    } catch (error) {
        dispatch({ type: FETCH_CASME_FAILURE });
        throw error;
    }
};

const requestOmatHenkilohakuOrganisaatiot = () => ({
    type: FETCH_HENKILOHAKUORGANISAATIOT_REQUEST,
});
const receiveOmatHenkilohakuOrganisaatiotSuccess = (organisaatiot, locale) => ({
    type: FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS,
    organisaatiot,
    locale,
});
const receiveOmatHenkilohakuOrganisaatiotFailure = () => ({
    type: FETCH_HENKILOHAKUORGANISAATIOT_FAILURE,
});
export const fetchOmatHenkiloHakuOrganisaatios = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    // Fetch only once
    if (
        getState().omattiedot.henkilohakuOrganisaatiot.length === 0 &&
        !getState().omattiedot.henkilohakuOrganisaatiotLoading
    ) {
        const oid = getState().omattiedot.data?.oid;
        dispatch(requestOmatHenkilohakuOrganisaatiot());
        const url = urls.url('kayttooikeus-service.henkilo.organisaatios', oid, { requiredRoles: 'HENKILOHAKU' });
        try {
            const omatHenkilohakuOrganisaatiot = await http.get(url);
            dispatch(receiveOmatHenkilohakuOrganisaatiotSuccess(omatHenkilohakuOrganisaatiot, getState().locale));
        } catch (error) {
            dispatch(receiveOmatHenkilohakuOrganisaatiotFailure());
            throw error;
        }
    }
};
