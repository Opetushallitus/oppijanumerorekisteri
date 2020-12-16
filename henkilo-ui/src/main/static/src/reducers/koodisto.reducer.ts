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
    FETCH_OPPILAITOSTYYPIT_FAILURE,
    FETCH_ORGANISAATIOTYYPIT_REQUEST,
    FETCH_ORGANISAATIOTYYPIT_SUCCESS,
    FETCH_ORGANISAATIOTYYPIT_FAILURE,
} from '../actions/actiontypes';
import StaticUtils from '../components/common/StaticUtils';
import { Koodisto } from '../types/domain/koodisto/koodisto.types';

const mapKoodistoValuesByLocale = (koodisto: Koodisto): any =>
    koodisto.map(koodi => ({
        value: koodi.koodiArvo.toLowerCase(),
        ...koodi.metadata
            .map(kieliKoodi => ({
                [kieliKoodi.kieli.toLowerCase()]: kieliKoodi.nimi,
            }))
            .reduce(StaticUtils.reduceListToObject, {}),
    }));

export type KoodistoState = {
    kieliKoodistoLoading: boolean;
    kansalaisuusKoodistoLoading: boolean;
    sukupuoliKoodistoLoading: boolean;
    yhteystietotyypitKoodistoLoading: boolean;
    yhteystietotyypit: Array<any>;
    kieli: Array<any>;
    kieliKoodisto: Koodisto;
    kansalaisuus: Array<any>;
    kansalaisuusKoodisto: Koodisto;
    sukupuoli: Array<any>;
    sukupuoliKoodisto: Koodisto;
    oppilaitostyypitLoading: boolean;
    oppilaitostyypit: Array<any>;
    organisaatiotyyppiKoodistoLoading: boolean;
    organisaatiotyyppiKoodisto: Koodisto;
    maatjavaltiot1KoodistoLoading: boolean;
    maatjavaltiot1: any;
};

const koodisto = (
    state: KoodistoState = {
        kieliKoodistoLoading: true,
        kansalaisuusKoodistoLoading: true,
        sukupuoliKoodistoLoading: false,
        yhteystietotyypitKoodistoLoading: true,
        kieli: [],
        kieliKoodisto: [],
        kansalaisuus: [],
        kansalaisuusKoodisto: [],
        sukupuoli: [],
        sukupuoliKoodisto: [],
        yhteystietotyypit: [],
        maatjavaltiot1KoodistoLoading: true,
        maatjavaltiot1: [],
        oppilaitostyypitLoading: false,
        oppilaitostyypit: [],
        organisaatiotyyppiKoodistoLoading: false,
        organisaatiotyyppiKoodisto: [],
    },
    action: any
): KoodistoState => {
    switch (action.type) {
        case FETCH_KANSALAISUUSKOODISTO_REQUEST:
            return Object.assign({}, state, { kansalaisuusKoodistoLoading: true });
        case FETCH_KANSALAISUUSKOODISTO_SUCCESS:
            return Object.assign({}, state, {
                kansalaisuusKoodistoLoading: false,
                kansalaisuus: mapKoodistoValuesByLocale(action.kansalaisuus),
                kansalaisuusKoodisto: action.kansalaisuus,
            });
        case FETCH_KIELIKOODISTO_REQUEST:
            return Object.assign({}, state, { kieliKoodistoLoading: true });
        case FETCH_KIELIKOODISTO_SUCCESS:
            return Object.assign({}, state, {
                kieliKoodistoLoading: false,
                kieli: mapKoodistoValuesByLocale(action.kieli),
                kieliKoodisto: action.kieli,
            });
        case FETCH_SUKUPUOLIKOODISTO_REQUEST:
            return Object.assign({}, state, { sukupuoliKoodistoLoading: true });
        case FETCH_SUKUPUOLIKOODISTO_SUCCESS:
            return Object.assign({}, state, {
                sukupuoliKoodistoLoading: false,
                sukupuoli: mapKoodistoValuesByLocale(action.sukupuoli),
                sukupuoliKoodisto: action.sukupuoli,
            });
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST:
            return Object.assign({}, state, {
                yhteystietotyypitKoodistoLoading: true,
            });
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS:
            return Object.assign({}, state, {
                yhteystietotyypitKoodistoLoading: false,
                yhteystietotyypit: mapKoodistoValuesByLocale(action.yhteystietotyypit),
            });
        case FETCH_MAATJAVALTIOTKOODISTO_REQUEST:
            return Object.assign({}, state, {
                maatjavaltiot1KoodistoLoading: true,
            });
        case FETCH_MAATJAVALTIOTKOODISTO_SUCCESS:
            return Object.assign({}, state, {
                maatjavaltiot1KoodistoLoading: false,
                maatjavaltiot1: mapKoodistoValuesByLocale(action.maatjavaltiot1),
            });
        case FETCH_OPPILAITOSTYYPIT_REQUEST:
            return { ...state, oppilaitostyypitLoading: true };
        case FETCH_OPPILAITOSTYYPIT_SUCCESS:
            return {
                ...state,
                oppilaitostyypitLoading: false,
                oppilaitostyypit: mapKoodistoValuesByLocale(action.oppilaitostyypit),
            };
        case FETCH_OPPILAITOSTYYPIT_FAILURE:
            return { ...state, oppilaitostyypitLoading: false };
        case FETCH_ORGANISAATIOTYYPIT_REQUEST:
            return { ...state, organisaatiotyyppiKoodistoLoading: true };
        case FETCH_ORGANISAATIOTYYPIT_SUCCESS:
            return {
                ...state,
                organisaatiotyyppiKoodistoLoading: false,
                organisaatiotyyppiKoodisto: action.organisaatiotyyppiKoodisto,
            };
        case FETCH_ORGANISAATIOTYYPIT_FAILURE:
            return { ...state, organisaatiotyyppiKoodistoLoading: false };
        default:
            return state;
    }
};

export default koodisto;
