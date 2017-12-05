// @flow
import {http} from '../http';
import {urls} from 'oph-urls-js';
import * as R from 'ramda';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, FETCH_HENKILO_ASIOINTIKIELI_REQUEST, FETCH_HENKILO_ASIOINTIKIELI_SUCCESS,
    FETCH_HENKILO_ASIOINTIKIELI_FAILURE, FETCH_CASME_REQUEST, FETCH_CASME_FAILURE, FETCH_CASME_SUCCESS, LOCATION_CHANGE
} from './actiontypes';
import {Dispatch} from "../types/dispatch.type";
import type {OrganisaatioHenkilo} from "../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type GetState = () => {
    omattiedot: {
        data: any,
        omattiedotLoaded: boolean,
        locale: string,
        organisaatios: Array<OrganisaatioHenkilo>,
    },
    locale: string,
}

type OmattiedotResponse = {
    oidHenkilo: string,
    isAdmin: boolean,
    isMiniAdmin: boolean,
    organisaatiot: Array<{
        organisaatioOid: string,
        kayttooikeudet: Array<{oikeus: string, palvelu: string,}>
    }>
}

export const fetchLocale = () => async (dispatch: Dispatch, getState: GetState) => {
    if (!getState().omattiedot.locale) {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.current.asiointikieli');
        dispatch({type: FETCH_HENKILO_ASIOINTIKIELI_REQUEST});
        try {
            const lang = await http.get(url);
            if (lang.length === 2) {
                dispatch({type: FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, lang});
                dispatch({type: LOCATION_CHANGE}); // Dispatch to trigger title change
            }
        }
        catch (error) {
            dispatch({type: FETCH_HENKILO_ASIOINTIKIELI_FAILURE});
            throw error;
        }
    }
};

const requestOmattiedot = () : {type: string} => ({type: FETCH_OMATTIEDOT_REQUEST});
const receiveOmattiedotSuccess = (json: OmattiedotResponse) => ({type: FETCH_OMATTIEDOT_SUCCESS, omattiedot: json});
const receiveOmattiedotFailure = (error) => ({type: FETCH_OMATTIEDOT_FAILURE, error});
export const fetchOmattiedot = () => async (dispatch: Dispatch, getState: GetState) => {
    if (!getState().omattiedot.data) {
        dispatch(requestOmattiedot());
        const url = urls.url('kayttooikeus-service.henkilo.current.omattiedot');
        try {
            const omattiedot = await http.get(url);
            dispatch(receiveOmattiedotSuccess(omattiedot));
        } catch (error) {
            dispatch(receiveOmattiedotFailure(error));
            throw error;
        }
    }
};

// Used only to determine if user has been synced to dlap
export const fetchCasMe = () => async (dispatch: Dispatch) => {
    dispatch({type: FETCH_CASME_REQUEST});
    try {
        const url = urls.url('cas.me');
        await http.get(url);
        dispatch({type: FETCH_CASME_SUCCESS});
    } catch (error) {
        dispatch({type: FETCH_CASME_FAILURE});
        console.error('Fetching cas me failed');
        throw error;
    }
};

const requestOmattiedotOrganisaatios = () => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST});
const receiveOmattiedotOrganisaatiosSuccess = (json, locale) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, organisaatios: json, locale});
const receiveOmattiedotOrganisaatiosFailure = (error) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, error});
export const fetchOmattiedotOrganisaatios = () => async (dispatch: Dispatch, getState: GetState) => {
    // Fetch only with the first call
    if (getState().omattiedot.organisaatios
        && !getState().omattiedot.organisaatios.length
        && !getState().omattiedot.omattiedotOrganisaatiosLoading) {
        const oid = R.path(['omattiedot', 'data', 'oid'], getState());
        const omattiedotLoading = getState().omattiedot.omattiedotLoaded;
        if (!oid && !omattiedotLoading) {
            try {
                await dispatch(fetchOmattiedot());
            } catch (error) {
                throw error;
            }
        }
        const userOid = getState().omattiedot.data.oid;
        dispatch(requestOmattiedotOrganisaatios());
        const url = urls.url('kayttooikeus-service.henkilo.organisaatios', userOid);
        try {
            const omattiedotOrganisaatios = await http.get(url);
            dispatch(receiveOmattiedotOrganisaatiosSuccess(omattiedotOrganisaatios, getState().locale));
        } catch (error) {
            console.error(`Failed fetching organisaatios for current user: ${userOid} - ${error}`);
            dispatch(receiveOmattiedotOrganisaatiosFailure(error));
            throw error;
        }
    }
};
