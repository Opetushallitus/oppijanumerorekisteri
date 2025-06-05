import { http } from '../http';
import { urls } from 'oph-urls-js';
import {
    FETCH_ALL_ORGANISAATIOS_REQUEST,
    FETCH_ALL_ORGANISAATIOS_SUCCESS,
    FETCH_ALL_ORGANISAATIOS_FAILURE,
    FETCH_ORGANISATIONS_REQUEST,
    FETCH_ORGANISATIONS_SUCCESS,
} from './actiontypes';
import { OrganisaatioState } from '../reducers/organisaatio.reducer';
import { OrganisaatioCriteria } from '../types/domain/organisaatio/organisaatio.types';
import { AppDispatch } from '../store';

type GetState = () => {
    organisaatio: OrganisaatioState;
    locale: string;
};

const requestAllOrganisaatios = () => ({ type: FETCH_ALL_ORGANISAATIOS_REQUEST });
const requestAllOrganisaatiosSuccess = (organisaatios) => ({
    type: FETCH_ALL_ORGANISAATIOS_SUCCESS,
    organisaatios,
});
const requestAllOrganisaatiosFailure = (error) => ({
    type: FETCH_ALL_ORGANISAATIOS_FAILURE,
    error,
});

export const fetchAllOrganisaatios =
    (
        criteria: OrganisaatioCriteria = {
            tyyppi: 'ORGANISAATIO',
            tila: ['AKTIIVINEN'],
        }
    ) =>
    async (dispatch: AppDispatch, getState: GetState) => {
        // Fetch only with the first call
        if (!getState().organisaatio.organisaatioLoaded && !getState().organisaatio.organisaatioLoading) {
            const url = urls.url('kayttooikeus-service.organisaatio', criteria);
            dispatch(requestAllOrganisaatios());
            try {
                const organisaatiot = await http.get(url);
                dispatch(requestAllOrganisaatiosSuccess(organisaatiot));
                dispatch({
                    type: FETCH_ORGANISATIONS_SUCCESS,
                    organisations: organisaatiot,
                });
            } catch (error) {
                dispatch(requestAllOrganisaatiosFailure(error));
                throw error;
            }
        }
    };

const requestOrganisations = (oidOrganisations) => ({
    type: FETCH_ORGANISATIONS_REQUEST,
    oidOrganisations,
});
const receiveOrganisations = (json) => ({
    type: FETCH_ORGANISATIONS_SUCCESS,
    organisations: json,
    receivedAt: Date.now(),
});
export const fetchOrganisations = (oidOrganisations: Array<string>) => (dispatch: AppDispatch, getState: GetState) => {
    if (!oidOrganisations) {
        console.error('Can not fetch null organisations');
        return Promise.resolve();
    }
    oidOrganisations = [...new Set(oidOrganisations)];
    dispatch(requestOrganisations(oidOrganisations));
    const promises = oidOrganisations
        .filter((oidOrganisation) => Object.keys(getState().organisaatio.cached).indexOf(oidOrganisation) === -1)
        .map((oidOrganisation) => {
            const url = urls.url('kayttooikeus-service.organisaatio.by-oid', oidOrganisation);
            return http.get(url).catch((error) => {
                console.log('Organisaation lataus epäonnistui', error);
                return {
                    oid: oidOrganisation,
                    nimi: {
                        fi: oidOrganisation,
                        en: oidOrganisation,
                        sv: oidOrganisation,
                    },
                    tyypit: [],
                };
            });
        });
    return Promise.all(promises.map((p) => p.catch((e) => e)))
        .then((json) => dispatch(receiveOrganisations(json)))
        .catch((e) => console.error(e));
};
