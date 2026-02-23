import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { NaviTab } from '../types/navigation.type';

export type NavigationState = {
    tabs: NaviTab[];
    backButton: boolean;
};

export const initialState: NavigationState = {
    tabs: [],
    backButton: false,
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
