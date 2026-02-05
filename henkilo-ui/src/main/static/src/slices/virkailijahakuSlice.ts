import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type VirkailijahakuFilters = {
    nameQuery?: string;
    organisaatioOid?: string;
    subOrganisation: boolean;
    ryhmaOid?: string;
    kayttooikeusryhmaId?: number;
};

const initialState: VirkailijahakuFilters = {
    nameQuery: undefined,
    organisaatioOid: undefined,
    subOrganisation: false,
    ryhmaOid: undefined,
    kayttooikeusryhmaId: undefined,
};

export const virkailijahakuSlice = createSlice({
    name: 'virkailijahaku',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<VirkailijahakuFilters>) => {
            state = action.payload;
            return state;
        },
        clearFilters: (state) => {
            state = initialState;
            return state;
        },
    },
});

export const { setFilters, clearFilters } = virkailijahakuSlice.actions;

export default virkailijahakuSlice.reducer;
