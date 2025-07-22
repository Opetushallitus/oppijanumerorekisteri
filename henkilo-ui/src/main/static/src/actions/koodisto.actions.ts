import { FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST, FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS } from './actiontypes';
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

export const fetchYhteystietotyypitKoodisto = () =>
    fetchGenericKoodisto(
        FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
        FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS,
        'koodisto-service.koodisto.yhteystietotyypit',
        'yhteystietotyypit'
    );
