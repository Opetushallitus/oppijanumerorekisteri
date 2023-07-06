import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE,
    FETCH_HENKILO_ASIOINTIKIELI_REQUEST,
    FETCH_HENKILO_ASIOINTIKIELI_SUCCESS,
    FETCH_HENKILO_ASIOINTIKIELI_FAILURE,
    FETCH_CASME_REQUEST,
    FETCH_CASME_FAILURE,
    FETCH_CASME_SUCCESS,
    LOCATION_CHANGE,
    UPDATE_ANOMUSILMOITUS,
    FETCH_HENKILOHAKUORGANISAATIOT_REQUEST,
    FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS,
    FETCH_HENKILOHAKUORGANISAATIOT_FAILURE,
    SET_MFA_PROVIDER,
} from './actiontypes';
import { Omattiedot } from '../types/domain/kayttooikeus/Omattiedot.types';
import { OmattiedotState } from '../reducers/omattiedot.reducer';
import { AppDispatch } from '../store';

type GetState = () => {
    omattiedot: OmattiedotState;
    locale: string;
};

export const fetchLocale = () => async (dispatch: AppDispatch) => {
    const url = urls.url('oppijanumerorekisteri-service.henkilo.current.asiointikieli');
    dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_REQUEST });
    try {
        const lang = await http.get<string>(url);
        if (lang.length === 2) {
            dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, lang });
            dispatch({ type: LOCATION_CHANGE }); // Dispatch to trigger title change
        }
    } catch (error) {
        dispatch({ type: FETCH_HENKILO_ASIOINTIKIELI_FAILURE });
        throw error;
    }
};

const updateAnomusilmoitusState = (value: boolean) => ({
    type: UPDATE_ANOMUSILMOITUS,
    value,
});
export const updateAnomusilmoitus = (value: boolean) => (dispatch: AppDispatch) => {
    dispatch(updateAnomusilmoitusState(value));
};

const requestOmattiedot = (): { type: string } => ({
    type: FETCH_OMATTIEDOT_REQUEST,
});
const receiveOmattiedotSuccess = (json: Omattiedot) => ({
    type: FETCH_OMATTIEDOT_SUCCESS,
    omattiedot: json,
});
const receiveOmattiedotFailure = (error) => ({
    type: FETCH_OMATTIEDOT_FAILURE,
    error,
});
export const fetchOmattiedot = () => async (dispatch: AppDispatch, getState: GetState) => {
    if (!getState().omattiedot.data) {
        dispatch(requestOmattiedot());
        const url = urls.url('kayttooikeus-service.henkilo.current.omattiedot');
        try {
            const omattiedot = await http.get<Omattiedot>(url);
            dispatch(receiveOmattiedotSuccess(omattiedot));
            dispatch<any>(fetchOmattiedotOrganisaatios());
        } catch (error) {
            dispatch(receiveOmattiedotFailure(error));
            throw error;
        }
    }
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

const requestOmattiedotOrganisaatios = () => ({
    type: FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
});
const receiveOmattiedotOrganisaatiosSuccess = (json, locale) => ({
    type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    organisaatios: json,
    locale,
});
const receiveOmattiedotOrganisaatiosFailure = (error) => ({
    type: FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE,
    error,
});
const fetchOmattiedotOrganisaatios = () => async (dispatch: AppDispatch, getState: GetState) => {
    // Fetch only with the first call
    if (
        getState().omattiedot.organisaatios &&
        !getState().omattiedot.organisaatios.length &&
        !getState().omattiedot.omattiedotOrganisaatiosLoading
    ) {
        const oid = getState().omattiedot.data?.oid;
        const omattiedotLoading = getState().omattiedot.omattiedotLoading;
        if (!oid && !omattiedotLoading) {
            dispatch<any>(fetchOmattiedot());
        }
        const userOid = getState().omattiedot.data.oid;
        dispatch(requestOmattiedotOrganisaatios());
        const url = urls.url('kayttooikeus-service.henkilo.organisaatios', userOid, { piilotaOikeudettomat: true });
        try {
            const omattiedotOrganisaatios = await http.get(url);
            dispatch(receiveOmattiedotOrganisaatiosSuccess(omattiedotOrganisaatios, getState().locale));
        } catch (error) {
            dispatch(receiveOmattiedotOrganisaatiosFailure(error));
            throw error;
        }
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
export const fetchOmatHenkiloHakuOrganisaatios = () => async (dispatch: AppDispatch, getState: GetState) => {
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

export const setMfaProvider = (mfaProvider: string) => ({
    type: SET_MFA_PROVIDER,
    mfaProvider,
});
