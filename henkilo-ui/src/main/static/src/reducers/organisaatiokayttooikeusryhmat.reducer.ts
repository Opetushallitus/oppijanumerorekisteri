import {
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_REQUEST,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_SUCCESS,
    FETCH_KAYTTOOIKEUSRYHMA_FOR_ORGANISAATIO_FAILURE,
} from '../actions/actiontypes';

export type OrganisaatioKayttooikeusryhmatState = {
    kayttooikeusryhmatLoading: boolean;
    organisaatioOid: string | null | undefined;
    kayttooikeusryhmat: Array<{}>;
};

export const OrganisaatioKayttooikeusryhmat = (
    state: OrganisaatioKayttooikeusryhmatState = {
        kayttooikeusryhmatLoading: false,
        organisaatioOid: null,
        kayttooikeusryhmat: [],
    },
    action: any
) => {
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
