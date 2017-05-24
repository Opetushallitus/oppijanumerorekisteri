import {
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    FETCH_HENKILO_ORGANISAATIOS_REQUEST, FETCH_HENKILO_ORGANISAATIOS_SUCCESS, FETCH_HENKILO_ORGANISAATIOS_FAILURE,
    UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_KAYTTAJATIETO_FAILURE, UPDATE_HENKILO_REQUEST,
    FETCH_HENKILO_SLAVES_REQUEST, FETCH_HENKILO_SLAVES_SUCCESS, FETCH_HENKILO_SLAVES_FAILURE
} from "../actions/actiontypes";
import StaticUtils from '../components/common/StaticUtils'

const mapOrgHenkilosWithOrganisations = (henkiloOrgs, organisations) => {
    return henkiloOrgs.map(henkiloOrg =>
        Object.assign({}, henkiloOrg, organisations[henkiloOrg.organisaatioOid] || StaticUtils.defaultOrganisaatio(henkiloOrg.organisaatioOid)));
};

export const henkilo = (state = {henkiloLoading: true, henkiloOrgsLoading: true, kayttajatietoLoading: true, henkilo: {},
    henkiloOrgs: [], kayttajatieto: {}, henkiloOrganisaatiosLoading: true, buttonNotifications: {}, notifications: [],
    henkiloOrganisaatios: [], slaves: [], slavesLoading: false}, action) => {

    switch (action.type) {
        case UPDATE_HENKILO_REQUEST:
        case FETCH_HENKILO_REQUEST:
            return Object.assign({}, state, {henkiloLoading: true});
        case FETCH_HENKILO_SUCCESS:
            return Object.assign({}, state, {henkiloLoading: false, henkilo: action.henkilo});
        case FETCH_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, {kayttajatietoLoading: true});
        case FETCH_KAYTTAJATIETO_SUCCESS:
        case FETCH_KAYTTAJATIETO_FAILURE:
            return Object.assign({}, state, {kayttajatietoLoading: false, kayttajatieto: action.kayttajatieto});
        case UPDATE_KAYTTAJATIETO_REQUEST:
            return Object.assign({}, state, {kayttajatietoLoading: true});
        case UPDATE_KAYTTAJATIETO_SUCCESS:
        case UPDATE_KAYTTAJATIETO_FAILURE:
            return Object.assign({}, state, {kayttatietoLoading: false, kayttajatieto: action.kayttajatieto});
        case FETCH_HENKILOORGS_REQUEST:
            return Object.assign({}, state, {henkiloOrgsLoading: true});
        case FETCH_HENKILOORGS_SUCCESS:
            return Object.assign({}, state, {
                henkiloOrgsLoading: false,
                henkiloOrgs: mapOrgHenkilosWithOrganisations(action.henkiloOrgs, action.organisations),
            });
        case FETCH_HENKILO_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { henkiloOrganisaatiosLoading: true});
        case FETCH_HENKILO_ORGANISAATIOS_SUCCESS:
        case FETCH_HENKILO_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, {
                henkiloOrganisaatiosLoading: false,
                henkiloOrganisaatios: action.henkiloOrganisaatios
            });
        case FETCH_HENKILO_SLAVES_REQUEST:
            return Object.assign({}, state, {slavesLoading: true});
        case FETCH_HENKILO_SLAVES_SUCCESS:
            return Object.assign({}, state, {slavesLoading: false, slaves: action.slaves });
        case FETCH_HENKILO_SLAVES_FAILURE:
            return Object.assign({}, state, {slavesLoading: false, slaves: []});
        default:
            return state;
    }
};
