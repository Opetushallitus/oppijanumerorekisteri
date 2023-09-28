import {
    FETCH_CASME_SUCCESS,
    UPDATE_ANOMUSILMOITUS,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
    FETCH_HENKILOHAKUORGANISAATIOT_REQUEST,
    FETCH_HENKILOHAKUORGANISAATIOT_SUCCESS,
    FETCH_HENKILOHAKUORGANISAATIOT_FAILURE,
} from '../actions/actiontypes';
import { KayttooikeusOrganisaatiot } from '../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';
import { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { AnyAction } from '@reduxjs/toolkit';

export type OmattiedotState = {
    readonly data?: { oid: string };
    readonly organisaatios: Array<OrganisaatioHenkilo>;
    readonly casMeSuccess: boolean;
    readonly isAdmin: boolean;
    readonly anomusilmoitus: boolean;
    readonly isOphVirkailija: boolean;
    readonly mfaProvider?: string;
    readonly idpEntityId?: string;
    readonly organisaatiot: Array<KayttooikeusOrganisaatiot>;
    readonly henkilohakuOrganisaatiotLoading: boolean;
    readonly henkilohakuOrganisaatiot: Array<OrganisaatioHenkilo>;
};

const initialState: OmattiedotState = {
    data: undefined,
    isAdmin: false,
    isOphVirkailija: false,
    mfaProvider: undefined,
    anomusilmoitus: false,
    organisaatios: [],
    casMeSuccess: false,
    organisaatiot: [],
    henkilohakuOrganisaatiotLoading: false,
    henkilohakuOrganisaatiot: [],
};

const omattiedot = (state: OmattiedotState = initialState, action: AnyAction): OmattiedotState => {
    switch (action.type) {
        case FETCH_OMATTIEDOT_SUCCESS:
            return {
                ...state,
                data: { oid: action.omattiedot.oidHenkilo },
                isAdmin: action.omattiedot.isAdmin,
                isOphVirkailija: action.omattiedot.isMiniAdmin,
                mfaProvider: action.omattiedot.mfaProvider,
                idpEntityId: action.omattiedot.idpEntityId,
                organisaatiot: action.omattiedot.organisaatiot,
                anomusilmoitus: action.omattiedot.anomusilmoitus,
            };
        case FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS: {
            return {
                ...state,
                organisaatios: action.organisaatios,
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
        case FETCH_CASME_SUCCESS:
            return Object.assign({}, state, { casMeSuccess: true });
        case UPDATE_ANOMUSILMOITUS:
            return { ...state, anomusilmoitus: action.value };
        default:
            return state;
    }
};

export default omattiedot;
