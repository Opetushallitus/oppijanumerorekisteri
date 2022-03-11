import {
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS,
    FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE,
    CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT,
    CLEAR_HAETTU_KAYTTOOIKEUSRYHMA,
} from '../actions/actiontypes';
import { HaettuKayttooikeusryhma } from '../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';

export type HaetutKayttooikeusryhmatState = {
    readonly isLoading: boolean;
    readonly data: Array<HaettuKayttooikeusryhma>;
};

export const haetutKayttooikeusryhmat = (
    state: HaetutKayttooikeusryhmatState = { isLoading: true, data: [] },
    action: any
): HaetutKayttooikeusryhmatState => {
    switch (action.type) {
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_REQUEST:
            return { ...state, isLoading: true };
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_SUCCESS:
            const uudet = action.haetutKayttooikeusryhmat.filter((uusi: HaettuKayttooikeusryhma) =>
                state.data.every((vanha: HaettuKayttooikeusryhma) => vanha.id !== uusi.id)
            );
            return { ...state, isLoading: false, data: [...state.data, ...uudet] };
        case FETCH_HAETUT_KAYTTOOIKEUSRYHMAT_FAILURE:
            return { ...state, isLoading: false };
        case CLEAR_HAETUT_KAYTTOOIKEUSRYHMAT:
            return { ...state, data: [] };
        case CLEAR_HAETTU_KAYTTOOIKEUSRYHMA:
            return {
                ...state,
                data: state.data.filter(
                    (haettuKayttooikeusryhma: HaettuKayttooikeusryhma) => haettuKayttooikeusryhma.id !== action.id
                ),
            };
        default:
            return state;
    }
};
