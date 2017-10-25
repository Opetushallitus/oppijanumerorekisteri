// @flow
import {
    FETCH_KANSALAISUUSKOODISTO_REQUEST, FETCH_KANSALAISUUSKOODISTO_SUCCESS, FETCH_KIELIKOODISTO_REQUEST,
    FETCH_KIELIKOODISTO_SUCCESS,
    FETCH_SUKUPUOLIKOODISTO_REQUEST, FETCH_SUKUPUOLIKOODISTO_SUCCESS, FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS, FETCH_MAATJAVALTIOTKOODISTO_REQUEST, FETCH_MAATJAVALTIOTKOODISTO_SUCCESS,
    FETCH_OPPILAITOSTYYPIT_REQUEST, FETCH_OPPILAITOSTYYPIT_SUCCESS, FETCH_OPPILAITOSTYYPIT_FAILURE
} from "../actions/actiontypes";
import StaticUtils from "../components/common/StaticUtils";
import type {Koodisto} from '../types/koodisto.type'

const mapKoodistoValuesByLocale = (koodisto: Koodisto): any => koodisto.map(koodi =>
    ({value: koodi.koodiArvo.toLowerCase(),
        ...koodi.metadata.map(kieliKoodi =>
            ({[kieliKoodi.kieli.toLowerCase()]: kieliKoodi.nimi})).reduce(StaticUtils.reduceListToObject, {})
    })
);

type State = {
    kieliKoodistoLoading: boolean,
    kansalaisuusKoodistoLoading: boolean,
    sukupuoliKoodistoLoading: boolean,
    yhteystietotyypitKoodistoLoading: boolean,
    kieli: any,
    kieliKoodisto: Koodisto,
    kansalaisuus: any,
    kansalaisuusKoodisto: Koodisto,
    sukupuoli: any,
    sukupuoliKoodisto: Koodisto,
    oppilaitostyypitLoading: boolean,
    oppilaitostyypit: any,
}

export const koodisto = (state: State = {kieliKoodistoLoading: true, kansalaisuusKoodistoLoading: true, sukupuoliKoodistoLoading: true,
                             yhteystietotyypitKoodistoLoading: true, kieli: [], kieliKoodisto: [], kansalaisuus: [], kansalaisuusKoodisto: [], sukupuoli: [], sukupuoliKoodisto: [],
                             yhteystietotyypit: [], maatjavaltiot1KoodistoLoading: true, maatjavaltiot1: [],
                            oppilaitostyypitLoading: false, oppilaitostyypit: []}, action: any): State => {
    switch (action.type) {
        case FETCH_KANSALAISUUSKOODISTO_REQUEST:
            return Object.assign({}, state, {kansalaisuusKoodistoLoading: true});
        case FETCH_KANSALAISUUSKOODISTO_SUCCESS:
            return Object.assign({}, state, {kansalaisuusKoodistoLoading: false, kansalaisuus: mapKoodistoValuesByLocale(action.kansalaisuus), kansalaisuusKoodisto: action.kansalaisuus});
        case FETCH_KIELIKOODISTO_REQUEST:
            return Object.assign({}, state, {kieliKoodistoLoading: true});
        case FETCH_KIELIKOODISTO_SUCCESS:
            return Object.assign({}, state, {kieliKoodistoLoading: false, kieli: mapKoodistoValuesByLocale(action.kieli), kieliKoodisto: action.kieli});
        case FETCH_SUKUPUOLIKOODISTO_REQUEST:
            return Object.assign({}, state, {sukupuoliKoodistoLoading: true});
        case FETCH_SUKUPUOLIKOODISTO_SUCCESS:
            return Object.assign({}, state, {sukupuoliKoodistoLoading: false, sukupuoli: mapKoodistoValuesByLocale(action.sukupuoli), sukupuoliKoodisto: action.sukupuoli});
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST:
            return Object.assign({}, state, {yhteystietotyypitKoodistoLoading: true});
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS:
            return Object.assign({}, state, {yhteystietotyypitKoodistoLoading: false, yhteystietotyypit: mapKoodistoValuesByLocale(action.yhteystietotyypit)});
        case FETCH_MAATJAVALTIOTKOODISTO_REQUEST:
            return Object.assign({}, state, {maatjavaltiot1KoodistoLoading: true});
        case FETCH_MAATJAVALTIOTKOODISTO_SUCCESS:
            return Object.assign({}, state, {maatjavaltiot1KoodistoLoading: false, maatjavaltiot1: mapKoodistoValuesByLocale(action.maatjavaltiot1)});
        case FETCH_OPPILAITOSTYYPIT_REQUEST:
            return {...state, oppilaitostyypitLoading: true};
        case FETCH_OPPILAITOSTYYPIT_SUCCESS:
            return {...state, oppilaitostyypitLoading: false, oppilaitostyypit: mapKoodistoValuesByLocale(action.oppilaitostyypit)};
        case FETCH_OPPILAITOSTYYPIT_FAILURE:
            return {...state, oppilaitostyypitLoading: false};
        default:
            return state;
    }
};
