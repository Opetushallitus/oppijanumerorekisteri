import {
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST, FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE, CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT,
    CLEAR_HAETTU_KAYTTOOIKEUSRYHMA
} from '../actions/actiontypes';

export const haetutKayttooikeusryhmat = (state = {isLoading: true, data: []}, action) => {
    switch (action.type) {
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST:
            return Object.assign({}, state, {isLoading: true});
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS:
            const uudet = action.haetutKayttooikeusryhmat
                .filter(uusi => state.data.every(vanha => vanha.id !== uusi.id))
            return Object.assign({}, state, {isLoading: false, data: [...state.data, ...uudet]});
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE:
            return Object.assign({}, state, {isLoading: false});
        case CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT:
            return Object.assign({}, state, {data: []});
        case CLEAR_HAETTU_KAYTTOOIKEUSRYHMA:
            return {...state, data: state.data.filter(haettuKayttooikeusryhma => haettuKayttooikeusryhma.id !== action.id)};
        default:
            return state;
    }
};
