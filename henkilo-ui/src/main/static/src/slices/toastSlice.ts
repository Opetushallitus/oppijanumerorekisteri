import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { ToastProps } from '../components/design-system/OphDsToast';

export type ToastState = {
    toasts: ToastProps[];
};

const initialState: ToastState = {
    toasts: [],
};

export const toastSlice = createSlice({
    name: 'toasts',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<ToastProps>) => {
            state.toasts = [...state.toasts, action.payload];
        },
        remove: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
    },
});

export const { add, remove } = toastSlice.actions;

export default toastSlice.reducer;
