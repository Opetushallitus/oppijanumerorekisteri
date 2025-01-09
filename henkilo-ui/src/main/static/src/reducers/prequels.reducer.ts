import { AnyAction } from '@reduxjs/toolkit';
import { FETCH_PREQUEL_REQUEST, FETCH_PREQUEL_SUCCESS } from '../actions/actiontypes';

export type PrequelsState = {
    notLoadedCount: number;
};

// notLoadedCount = number of prequels
export const prequels = (state: Readonly<PrequelsState> = { notLoadedCount: 2 }, action: AnyAction): PrequelsState => {
    switch (action.type) {
        case FETCH_PREQUEL_REQUEST:
            return state;
        case FETCH_PREQUEL_SUCCESS:
            return {
                ...state,
                notLoadedCount: state.notLoadedCount !== 0 ? state.notLoadedCount - 1 : state.notLoadedCount,
            };
        default:
            return state;
    }
};
