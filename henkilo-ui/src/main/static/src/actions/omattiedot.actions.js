// @flow
import {http} from '../http';
import {urls} from 'oph-urls-js';
import R from 'ramda';
import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, FETCH_HENKILO_ASIOINTIKIELLI_REQUEST, FETCH_HENKILO_ASIOINTIKIELLI_SUCCESS,
    FETCH_HENKILO_ASIOINTIKIELLI_FAILURE
} from './actiontypes';

type Dispatch = (any) => void;

type GetState = () => {
    omattiedot: {
        data: any,
        omattiedotLoaded: boolean,
        locale: string,
        organisaatios: Array<{}>,
    };
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
        dispatch(() => ({type: FETCH_HENKILO_ASIOINTIKIELLI_REQUEST}));
        try {
            const lang = await http.get(url);
            dispatch(() => ({type: FETCH_HENKILO_ASIOINTIKIELLI_SUCCESS, lang}));
        }
        catch (error) {
            dispatch(() => ({type: FETCH_HENKILO_ASIOINTIKIELLI_FAILURE}));
            console.error('Could not fetch asiointikieli for current henkilo');
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

const requestOmattiedotOrganisaatios = () => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST});
const receiveOmattiedotOrganisaatiosSuccess = (json) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, organisaatios: json});
const receiveOmattiedotOrganisaatiosFailure = (error) => ({type: FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, error});
export const fetchOmattiedotOrganisaatios = () => async (dispatch: Dispatch, getState: GetState) => {
    if (getState().omattiedot.organisaatios && !getState().omattiedot.organisaatios.length) {
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
            dispatch(receiveOmattiedotOrganisaatiosSuccess(omattiedotOrganisaatios));
        } catch (error) {
            console.error(`Failed fetching organisaatios for current user: ${userOid} - ${error}`);
            dispatch(receiveOmattiedotOrganisaatiosFailure(error));
            throw error;
        }
    }
};
