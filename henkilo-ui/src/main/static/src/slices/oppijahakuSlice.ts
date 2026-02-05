import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { OppijahakuCriteria } from '../api/oppijanumerorekisteri';

const initialState: OppijahakuCriteria = {
    query: '',
    passive: false,
    page: 0,
};

export const oppijahakuSlice = createSlice({
    name: 'oppijahaku',
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<OppijahakuCriteria>) => {
            state = action.payload;
            return state;
        },
        clearState: (state) => {
            state = initialState;
            return state;
        },
    },
});

export const { setState, clearState } = oppijahakuSlice.actions;

export default oppijahakuSlice.reducer;
