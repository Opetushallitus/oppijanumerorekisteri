import {
    FETCH_KANSALAISUUSKOODISTO_FAILURE, FETCH_KANSALAISUUSKOODISTO_REQUEST,
    FETCH_KANSALAISUUSKOODISTO_SUCCESS, FETCH_KIELIKOODISTO_FAILURE, FETCH_KIELIKOODISTO_REQUEST,
    FETCH_KIELIKOODISTO_SUCCESS, FETCH_SUKUPUOLIKOODISTO_FAILURE, FETCH_SUKUPUOLIKOODISTO_REQUEST,
    FETCH_SUKUPUOLIKOODISTO_SUCCESS, FETCH_YHTEYSTIETOTYYPITKOODISTO_FAILURE, FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS, FETCH_MAATJAVALTIOTKOODISTO_REQUEST, FETCH_MAATJAVALTIOTKOODISTO_SUCCESS,
    FETCH_MAATJAVALTIOTKOODISTO_FAILURE
} from "./actiontypes";
import {http} from "../http";
import {urls} from 'oph-urls-js';

const requestGenericKoodisto = (fetchRequestType) => ({type: fetchRequestType});
const receiveGenericKoodisto = (fetchSuccessType, typeField, json) => ({
    type: fetchSuccessType,
    [typeField]: json,
    receivedAt: Date.now()
});
const fetchGenericKoodisto = (fetchRequestType, fetchSuccessType, fetchFailureType, urlProperty, typeField) => ((dispatch, getState) => {
    // Update only if not already fetched
    if(!getState().koodisto[typeField].length) {
        dispatch(requestGenericKoodisto(fetchRequestType, ));
        const url = urls.url(urlProperty);
        http.get(url).then(json => {
            dispatch(receiveGenericKoodisto(fetchSuccessType, typeField, json))
        });
    }
});

export const fetchKieliKoodisto = () => fetchGenericKoodisto(FETCH_KIELIKOODISTO_REQUEST, FETCH_KIELIKOODISTO_SUCCESS,
    FETCH_KIELIKOODISTO_FAILURE, 'koodisto-service.koodisto.kieli', 'kieli');

export const fetchKansalaisuusKoodisto = () => fetchGenericKoodisto(FETCH_KANSALAISUUSKOODISTO_REQUEST, FETCH_KANSALAISUUSKOODISTO_SUCCESS,
    FETCH_KANSALAISUUSKOODISTO_FAILURE, 'koodisto-service.koodisto.kansalaisuus', 'kansalaisuus');

export const fetchSukupuoliKoodisto = () => fetchGenericKoodisto(FETCH_SUKUPUOLIKOODISTO_REQUEST, FETCH_SUKUPUOLIKOODISTO_SUCCESS,
    FETCH_SUKUPUOLIKOODISTO_FAILURE, 'koodisto-service.koodisto.sukupuoli', 'sukupuoli');

export const fetchYhteystietotyypitKoodisto = () => fetchGenericKoodisto(FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST, FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_FAILURE, 'koodisto-service.koodisto.yhteystietotyypit', 'yhteystietotyypit');

export const fetchMaatJaValtiotKoodisto = () => fetchGenericKoodisto(FETCH_MAATJAVALTIOTKOODISTO_REQUEST,
    FETCH_MAATJAVALTIOTKOODISTO_SUCCESS, FETCH_MAATJAVALTIOTKOODISTO_FAILURE, 'koodisto-service.koodisto.maatjavaltiot1', 'maatjavaltiot1');

