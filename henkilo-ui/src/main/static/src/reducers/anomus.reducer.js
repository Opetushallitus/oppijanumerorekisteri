import {
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST, FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE, CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT
} from '../actions/actiontypes';

export const haetutKayttooikeusryhmat = (state = {loading: true, data: []}, action) => {
    switch (action.type) {
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST:
            return Object.assign({}, state, {loading: true});
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS:
            return Object.assign({}, state, {loading: false, data: [...action.haetutKayttooikeusryhmat]});
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE:
            return Object.assign({}, state, {loading: false});
        case CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT:
            return Object.assign({}, state, {data: []});
        default:
            return state;
    }
};
