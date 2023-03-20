import {
    FETCH_OMATTIEDOT_REQUEST,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE,
    FETCH_CASME_SUCCESS,
    UPDATE_ANOMUSILMOITUS,
    FETCH_HENKILOHAKUORGANISAATIOT_REQUEST,
    FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS,
    FETCH_HENKILOHAKUORGANISAATIOT_FAILURE,
    SET_MFA_PROVIDER,
} from '../actions/actiontypes';
import { getOrganisaatioOptionsAndFilter } from '../utilities/organisaatio.util';
import { KayttooikeusOrganisaatiot } from '../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';
import { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';

export type OmattiedotState = {
    readonly omattiedotLoading: boolean;
    readonly data: any;
    readonly initialized: boolean;
    readonly omattiedotOrganisaatiosLoading: boolean;
    readonly organisaatios: Array<OrganisaatioHenkilo>;
    readonly casMeSuccess: boolean;
    readonly isAdmin: boolean;
    readonly anomusilmoitus: boolean;
    readonly isOphVirkailija: boolean;
    readonly mfaProvider?: string;
    readonly organisaatioRyhmaOptions: Array<any>;
    readonly organisaatioRyhmaFilter: Array<any>;
    readonly organisaatiot: Array<KayttooikeusOrganisaatiot>;
    readonly henkilohakuOrganisaatiotLoading: boolean;
    readonly henkilohakuOrganisaatiot: Array<OrganisaatioHenkilo>;
};

const initialState: OmattiedotState = {
    omattiedotLoading: false,
    data: undefined,
    isAdmin: false,
    isOphVirkailija: false,
    mfaProvider: undefined,
    anomusilmoitus: false,
    initialized: false,
    omattiedotOrganisaatiosLoading: false,
    organisaatios: [],
    casMeSuccess: false,
    organisaatioRyhmaOptions: [],
    organisaatioRyhmaFilter: [],
    organisaatiot: [],
    henkilohakuOrganisaatiotLoading: false,
    henkilohakuOrganisaatiot: [],
};

const omattiedot = (state: OmattiedotState = initialState, action) => {
    switch (action.type) {
        case FETCH_OMATTIEDOT_REQUEST:
            return Object.assign({}, state, { omattiedotLoading: true });
        case FETCH_OMATTIEDOT_SUCCESS:
            return {
                ...state,
                omattiedotLoading: false,
                data: { oid: action.omattiedot.oidHenkilo },
                isAdmin: action.omattiedot.isAdmin,
                isOphVirkailija: action.omattiedot.isMiniAdmin,
                mfaProvider: action.omattiedot.mfaProvider,
                organisaatiot: action.omattiedot.organisaatiot,
                initialized: true,
                anomusilmoitus: action.omattiedot.anomusilmoitus,
            };
        case FETCH_OMATTIEDOT_FAILURE:
            return Object.assign({}, state, {
                omattiedotLoading: false,
                initialized: true,
            });
        case FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, {
                omattiedotOrganisaatiosLoading: true,
            });
        case FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS: {
            const newRyhmaOptions = getOrganisaatioOptionsAndFilter(action.organisaatios, action.locale, true);
            return {
                ...state,
                organisaatios: action.organisaatios,
                omattiedotOrganisaatiosLoading: false,
                organisaatioRyhmaOptions: newRyhmaOptions.options,
                organisaatioRyhmaFilter: newRyhmaOptions.filterOptions,
            };
        }
        case FETCH_HENKILOHAKUORGANISAATIOT_REQUEST:
            return { ...state, henkilohakuOrganisaatiotLoading: true };
        case FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS:
            return {
                ...state,
                henkilohakuOrganisaatiot: action.organisaatiot,
                henkilohakuOrganisaatiotLoading: false,
            };
        case FETCH_HENKILOHAKUORGANISAATIOT_FAILURE:
            return { ...state, henkilohakuOrganisaatiotLoading: false };
        case FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, {
                omattiedotOrganisaatiosLoading: false,
            });
        case FETCH_CASME_SUCCESS:
            return Object.assign({}, state, { casMeSuccess: true });
        case UPDATE_ANOMUSILMOITUS:
            return { ...state, anomusilmoitus: action.value };
        case SET_MFA_PROVIDER:
            return { ...state, mfaProvider: action.mfaProvider };
        default:
            return state;
    }
};

export default omattiedot;
