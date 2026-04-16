import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { NaviTab } from '../types/navigation.type';

export type NavigationState = {
    tabs: NaviTab[];
};

export const initialState: NavigationState = {
    tabs: [],
};

export const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setNavigation: (state, action: PayloadAction<NavigationState>) => {
            state = action.payload;
            return state;
        },
        clearNavigation: (state, _action: PayloadAction<NavigationState>) => {
            state = initialState;
            return state;
        },
    },
});

export const { setNavigation, clearNavigation } = navigationSlice.actions;

export default navigationSlice.reducer;
