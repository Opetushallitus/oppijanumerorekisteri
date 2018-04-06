// @flow
import {
    FETCH_OMATTIEDOT_REQUEST, FETCH_OMATTIEDOT_SUCCESS, FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST, FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE, FETCH_CASME_SUCCESS
} from '../actions/actiontypes';
import {getOrganisaatioOptionsAndFilter} from "../utilities/organisaatio.util";
import type {KayttooikeusOrganisaatiot} from "../types/domain/kayttooikeus/KayttooikeusPerustiedot.types";


export type OmattiedotState = {|
    +omattiedotLoading: boolean,
    +data: any,
    +initialized: boolean,
    +omattiedotOrganisaatiosLoading: boolean,
    +organisaatios: Array<any>,
    +casMeSuccess: boolean,
    +isAdmin: boolean,
    +isOphVirkailija: boolean,
    +organisaatioOptions: Array<any>,
    +organisaatioOptionsFilter: Array<any>,
    +organisaatioRyhmaOptions: Array<any>,
    +organisaatioRyhmaFilter: Array<any>,
    +organisaatiot: Array<KayttooikeusOrganisaatiot>
|}

const initialState: OmattiedotState = {
    omattiedotLoading: false,
    data: undefined,
    isAdmin: false,
    isOphVirkailija: false,
    initialized: false,
    omattiedotOrganisaatiosLoading: false,
    organisaatios: [],
    casMeSuccess: false,
    organisaatioOptions: [],
    organisaatioOptionsFilter: [],
    organisaatioRyhmaOptions: [],
    organisaatioRyhmaFilter: [],
    organisaatiot: []
};

export const omattiedot = (state: OmattiedotState = initialState, action: any) => {
    switch(action.type) {
        case FETCH_OMATTIEDOT_REQUEST:
            return Object.assign({}, state, { omattiedotLoading: true });
        case FETCH_OMATTIEDOT_SUCCESS:
            return {...state,
                omattiedotLoading: false,
                data: {oid: action.omattiedot.oidHenkilo},
                isAdmin: action.omattiedot.isAdmin,
                isOphVirkailija: action.omattiedot.isMiniAdmin,
                organisaatiot: action.omattiedot.organisaatiot,
                initialized: true,
            };
        case FETCH_OMATTIEDOT_FAILURE:
            return Object.assign({}, state, { omattiedotLoading: false, initialized: true,});
        case FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { omattiedotOrganisaatiosLoading: true});
        case FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS:
            const newOrganisaatioOptions = getOrganisaatioOptionsAndFilter(action.organisaatios, action.locale, false);
            const newRyhmaOptions = getOrganisaatioOptionsAndFilter(action.organisaatios, action.locale, true);
            return {...state,
                organisaatios: action.organisaatios,
                omattiedotOrganisaatiosLoading: false,
                organisaatioOptions: newOrganisaatioOptions.options,
                organisaatioOptionsFilter: newOrganisaatioOptions.filterOptions,
                organisaatioRyhmaOptions: newRyhmaOptions.options,
                organisaatioRyhmaFilter: newRyhmaOptions.filterOptions,
            };
        case FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, { omattiedotOrganisaatiosLoading: false } );
        case FETCH_CASME_SUCCESS:
            return Object.assign({}, state, {casMeSuccess: true});
        default:
            return state;
    }

};
