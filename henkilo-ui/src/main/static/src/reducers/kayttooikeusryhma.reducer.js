import {FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS} from "../actions/actiontypes";

export const kayttooikeus = (state={kayttooikeusLoading: true, kayttooikeus: []}, action) => {
    switch(action.type) {
        case FETCH_ALL_KAYTTOOIKEUSRYHMAS_FOR_HENKILO_SUCCESS:
            return Object.assign({}, state, {kayttooikeusLoading: false, kayttooikeus: action.kayttooikeus});
        default:
            return state;
    }
};
