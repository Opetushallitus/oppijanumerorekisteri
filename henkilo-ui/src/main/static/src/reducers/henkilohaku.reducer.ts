import { AnyAction } from '@reduxjs/toolkit';
import { UPDATE_HENKILOHAKU_FILTERS } from '../actions/actiontypes';
import { HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';

export type HenkilohakuState = {
    readonly filters: HenkilohakuCriteria & { ryhmaOid?: string };
};

const initialState: HenkilohakuState = {
    filters: {
        noOrganisation: false,
        subOrganisation: true,
        passivoitu: false,
        duplikaatti: false,
    },
};

export const henkilohakuState = (state = initialState, action: AnyAction): HenkilohakuState => {
    switch (action.type) {
        case UPDATE_HENKILOHAKU_FILTERS:
            return { ...state, filters: action.filters };
        default:
            return state;
    }
};
