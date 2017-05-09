import {
    DELETE_HENKILOORGS_FAILURE,
    FETCH_HENKILO_REQUEST, FETCH_HENKILO_SUCCESS, FETCH_HENKILOORGS_REQUEST,
    FETCH_HENKILOORGS_SUCCESS, FETCH_KAYTTAJATIETO_FAILURE, FETCH_KAYTTAJATIETO_REQUEST, FETCH_KAYTTAJATIETO_SUCCESS,
    PASSIVOI_HENKILO_FAILURE, YKSILOI_HENKILO_FAILURE,
    FETCH_HENKILO_ORGANISAATIOS_REQUEST, FETCH_HENKILO_ORGANISAATIOS_SUCCESS, FETCH_HENKILO_ORGANISAATIOS_FAILURE,
    UPDATE_KAYTTAJATIETO_REQUEST, UPDATE_KAYTTAJATIETO_SUCCESS, UPDATE_KAYTTAJATIETO_FAILURE
} from "../actions/actiontypes";

const mapOrgHenkilosWithOrganisations = (henkiloOrgs, organisations) => {
    return henkiloOrgs.filter(henkiloOrg => Object.keys(organisations).indexOf(henkiloOrg.organisaatioOid) !== -1)
        .map(henkiloOrg => Object.assign({}, henkiloOrg, organisations[henkiloOrg.organisaatioOid]));
};

export const henkilo = (state = {henkiloLoading: true, henkiloOrgsLoading: true, kayttajatietoLoading: true, henkilo: {},
    henkiloOrgs: [], kayttajatieto: {}, buttonNotifications: {}, notifications: [], henkiloOrganisaatiosLoading: true,
    henkiloOrganisaatios: []}, action) => {

    switch (action.type) {
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
        case PASSIVOI_HENKILO_FAILURE:
        case YKSILOI_HENKILO_FAILURE:
        case DELETE_HENKILOORGS_FAILURE:
            const newState = Object.assign({}, state);
            newState.buttonNotifications[action.buttonNotification.position] = action.buttonNotification;
            return newState;
        case FETCH_HENKILO_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { henkiloOrganisaatiosLoading: true});
        case FETCH_HENKILO_ORGANISAATIOS_SUCCESS:
        case FETCH_HENKILO_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, {
                henkiloOrganisaatiosLoading: false,
                henkiloOrganisaatios: action.henkiloOrganisaatios
            });
        default:
            return state;
    }
};
