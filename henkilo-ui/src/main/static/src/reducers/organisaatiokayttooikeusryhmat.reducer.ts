import { AnyAction } from '@reduxjs/toolkit';
import {
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
} from '../actions/actiontypes';
import { Kayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';

export type OrganisaatioKayttooikeusryhmatState = {
    kayttooikeusryhmatLoading: boolean;
    organisaatioOid: string | null | undefined;
    kayttooikeusryhmat: Array<Kayttooikeusryhma>;
};

export const OrganisaatioKayttooikeusryhmat = (
    state: OrganisaatioKayttooikeusryhmatState = {
        kayttooikeusryhmatLoading: false,
        organisaatioOid: null,
        kayttooikeusryhmat: [],
    },
    action: AnyAction
): OrganisaatioKayttooikeusryhmatState => {
    switch (action.type) {
        case FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST:
            return Object.assign({}, state, {
                kayttooikeusryhmatLoading: true,
                organisaatioOid: action.organisaatioOid,
            });
        case FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS:
            return Object.assign({}, state, {
                kayttooikeusryhmatLoading: false,
                kayttooikeusryhmat: action.kayttooikeusryhmat,
            });
        case FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE:
            return Object.assign({}, state, {
                kayttooikeusryhmatLoading: false,
                kayttooikeusryhmat: [],
            });
        default:
            return state;
    }
};
