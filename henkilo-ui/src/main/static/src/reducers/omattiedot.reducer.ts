import {
    UPDATE_ANOMUSILMOITUS,
    FETCH_OMATTIEDOT_SUCCESS,
    FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS,
} from '../actions/actiontypes';
import { KayttooikeusOrganisaatiot } from '../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';
import { OrganisaatioHenkilo } from '../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { AnyAction } from '@reduxjs/toolkit';

export type OmattiedotState = {
    readonly data?: { oid: string };
    readonly organisaatios: Array<OrganisaatioHenkilo>;
    readonly isAdmin: boolean;
    readonly anomusilmoitus: number[];
    readonly isOphVirkailija: boolean;
    readonly mfaProvider?: string;
    readonly idpEntityId?: string;
    readonly organisaatiot: Array<KayttooikeusOrganisaatiot>;
};

const initialState: OmattiedotState = {
    data: undefined,
    isAdmin: false,
    isOphVirkailija: false,
    mfaProvider: undefined,
    anomusilmoitus: [],
    organisaatios: [],
    organisaatiot: [],
};

const omattiedot = (state: Readonly<OmattiedotState> = initialState, action: AnyAction): OmattiedotState => {
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
        case UPDATE_ANOMUSILMOITUS:
            return { ...state, anomusilmoitus: action.value };
        default:
            return state;
    }
};

export default omattiedot;
