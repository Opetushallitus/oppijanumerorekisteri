import {
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE, FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS, FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST,
    FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS, FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS,
    FETCH_GRANTABLE_REQUEST, FETCH_GRANTABLE_SUCCESS,
    FETCH_ALL_KAYTTOOIKEUSRYHMA_SUCCESS, FETCH_ALL_KAYTTOOIKEUSRYHMA_FAILURE, FETCH_ALL_KAYTTOOIKEUSRYHMA_REQUEST
} from "../actions/actiontypes";

export const kayttooikeus = (state = {
                                 kayttooikeusLoading: true,
                                 kayttooikeus: [],
                                 kayttooikeusAnomusLoading: true,
                                 kayttooikeusAnomus: [],
                                 allowedKayttooikeus: {},
                                 grantableKayttooikeus: {},
                                 grantableKayttooikeusLoading: true,
                                 allKayttooikeusryhmas: [],
                                 allKayttooikeusryhmasLoading: false,
                             },
                             action) => {
    switch(action.type) {
        case FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_REQUEST:
            return Object.assign({}, state, {kayttooikeusLoading: true});
        case FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS:
            return Object.assign({}, state, {kayttooikeusLoading: false, kayttooikeus: action.kayttooikeus});
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_REQUEST:
            return Object.assign({}, state, {kayttooikeusAnomusLoading: true});
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_SUCCESS:
            return Object.assign({}, state, {kayttooikeusAnomusLoading: false, kayttooikeusAnomus: action.kayttooikeusAnomus});
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_ANOMUS_FOR_HENKILO_FAILURE:
            return Object.assign({}, state, {kayttooikeusAnomusLoading: false, kayttooikeusAnomus: []});
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS:
            return Object.assign({}, state, {
                allowedKayttooikeus: {
                    ...state.allowedKayttooikeus,
                    [action.oidHenkilo]: action.allowedKayttooikeus,
                }
            });
        case FETCH_GRANTABLE_REQUEST:
            return Object.assign({}, state, {grantableKayttooikeusLoading: true,});
        case FETCH_GRANTABLE_SUCCESS:
            return Object.assign({}, state, {grantableKayttooikeusLoading: false, grantableKayttooikeus: action.data});
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_REQUEST:
            return {...state, allKayttooikeusryhmasLoading: true};
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_SUCCESS:
            return {...state, allKayttooikeusryhmas: action.data, allKayttooikeusryhmasLoading: false};
        case FETCH_ALL_KAYTTOOIKEUSRYHMA_FAILURE:
            return {...state, allKayttooikeusryhmasLoading: false};
        default:
            return state;
    }
};
