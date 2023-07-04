import {
    FETCH_KANSALAISUUSKOODISTO_REQUEST,
    FETCH_KANSALAISUUSKOODISTO_SUCCESS,
    FETCH_KIELIKOODISTO_REQUEST,
    FETCH_KIELIKOODISTO_SUCCESS,
    FETCH_SUKUPUOLIKOODISTO_REQUEST,
    FETCH_SUKUPUOLIKOODISTO_SUCCESS,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS,
    FETCH_MAATJAVALTIOTKOODISTO_REQUEST,
    FETCH_MAATJAVALTIOTKOODISTO_SUCCESS,
    FETCH_OPPILAITOSTYYPIT_REQUEST,
    FETCH_OPPILAITOSTYYPIT_SUCCESS,
    FETCH_ORGANISAATIOTYYPIT_REQUEST,
    FETCH_ORGANISAATIOTYYPIT_SUCCESS,
} from './actiontypes';
import { http } from '../http';
import { urls } from 'oph-urls-js';
import { AppDispatch, RootState } from '../store';

const requestGenericKoodisto = (fetchRequestType) => ({ type: fetchRequestType });
const receiveGenericKoodisto = (fetchSuccessType, typeField, json) => ({
    type: fetchSuccessType,
    [typeField]: json,
    receivedAt: Date.now(),
});
const fetchGenericKoodisto =
    (fetchRequestType, fetchSuccessType, urlProperty, typeField) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
        // Update only if not already fetched
        if (!getState().koodisto[typeField].length) {
            dispatch(requestGenericKoodisto(fetchRequestType));
            const url = urls.url(urlProperty);
            http.get(url).then((json) => {
                dispatch(receiveGenericKoodisto(fetchSuccessType, typeField, json));
            });
        }
    };

export const fetchKieliKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_KIELIKOODISTO_REQUEST,
        FETCH_KIELIKOODISTO_SUCCESS,
        'koodisto-service.koodisto.kieli',
        'kieli'
    );

export const fetchKansalaisuusKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_KANSALAISUUSKOODISTO_REQUEST,
        FETCH_KANSALAISUUSKOODISTO_SUCCESS,
        'koodisto-service.koodisto.kansalaisuus',
        'kansalaisuus'
    );

export const fetchSukupuoliKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_SUKUPUOLIKOODISTO_REQUEST,
        FETCH_SUKUPUOLIKOODISTO_SUCCESS,
        'koodisto-service.koodisto.sukupuoli',
        'sukupuoli'
    );

export const fetchYhteystietotyypitKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
        FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS,
        'koodisto-service.koodisto.yhteystietotyypit',
        'yhteystietotyypit'
    );

export const fetchMaatJaValtiotKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_MAATJAVALTIOTKOODISTO_REQUEST,
        FETCH_MAATJAVALTIOTKOODISTO_SUCCESS,
        'koodisto-service.koodisto.maatjavaltiot1',
        'maatjavaltiot1'
    );

export const fetchOppilaitostyypit = () =>
    fetchGenericKoodisto(
        FETCH_OPPILAITOSTYYPIT_REQUEST,
        FETCH_OPPILAITOSTYYPIT_SUCCESS,
        'koodisto-service.koodisto.oppilaitostyypit',
        'oppilaitostyypit'
    );

export const fetchOrganisaatiotyypit = () =>
    fetchGenericKoodisto(
        FETCH_ORGANISAATIOTYYPIT_REQUEST,
        FETCH_ORGANISAATIOTYYPIT_SUCCESS,
        'koodisto-service.koodisto.organisaatiotyypit',
        'organisaatiotyyppiKoodisto'
    );
