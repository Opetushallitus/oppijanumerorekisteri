import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';

export type HenkilohakuState = HenkilohakuCriteria & { ryhmaOid?: string };

const initialState: HenkilohakuState = {
    noOrganisation: false,
    subOrganisation: true,
    passivoitu: false,
    duplikaatti: false,
    ryhmaOid: undefined,
};

export const henkilohakuSlice = createSlice({
    name: 'henkilohaku',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<HenkilohakuState>) => {
            state = action.payload;
            return state;
        },
        clearFilters: (state) => {
            state = initialState;
            return state;
        },
    },
});

export const { setFilters, clearFilters } = henkilohakuSlice.actions;

export default henkilohakuSlice.reducer;
