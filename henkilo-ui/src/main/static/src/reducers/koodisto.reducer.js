import {
    FETCH_KANSALAISUUSKOODISTO_REQUEST, FETCH_KANSALAISUUSKOODISTO_SUCCESS, FETCH_KIELIKOODISTO_REQUEST,
    FETCH_KIELIKOODISTO_SUCCESS,
    FETCH_SUKUPUOLIKOODISTO_REQUEST, FETCH_SUKUPUOLIKOODISTO_SUCCESS, FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS
} from "../actions/actiontypes";
import StaticUtils from "../components/common/StaticUtils";

const mapKoodistoValuesByLocale = (koodisto) => koodisto.map(koodi =>
    ({value: koodi.koodiArvo.toLowerCase(),
        ...koodi.metadata.map(kieliKoodi =>
            ({[kieliKoodi.kieli.toLowerCase()]: kieliKoodi.nimi})).reduce(StaticUtils.reduceListToObject, {})
    })
);

export const koodisto = (state = {kieliKoodistoLoading: true, kansalaisuusKoodistoLoading: true, sukupuoliKoodistoLoading: true,
                             yhteystietotyypitKoodistoLoading: true, kieli: [], kansalaisuus: [], sukupuoli: [],
                             yhteystietotyypit: [], }, action) => {
    switch (action.type) {
        case FETCH_KANSALAISUUSKOODISTO_REQUEST:
            return Object.assign({}, state, {kansalaisuusKoodistoLoading: true});
        case FETCH_KANSALAISUUSKOODISTO_SUCCESS:
            return Object.assign({}, state, {kansalaisuusKoodistoLoading: false, kansalaisuus: mapKoodistoValuesByLocale(action.kansalaisuus)});
        case FETCH_KIELIKOODISTO_REQUEST:
            return Object.assign({}, state, {kieliKoodistoLoading: true});
        case FETCH_KIELIKOODISTO_SUCCESS:
            return Object.assign({}, state, {kieliKoodistoLoading: false, kieli: mapKoodistoValuesByLocale(action.kieli)});
        case FETCH_SUKUPUOLIKOODISTO_REQUEST:
            return Object.assign({}, state, {sukupuoliKoodistoLoading: true});
        case FETCH_SUKUPUOLIKOODISTO_SUCCESS:
            return Object.assign({}, state, {sukupuoliKoodistoLoading: false, sukupuoli: mapKoodistoValuesByLocale(action.sukupuoli)});
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST:
            return Object.assign({}, state, {yhteystietotyypitKoodistoLoading: true});
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS:
            return Object.assign({}, state, {yhteystietotyypitKoodistoLoading: false, yhteystietotyypit: mapKoodistoValuesByLocale(action.yhteystietotyypit)});
        default:
            return state;
    }
};
