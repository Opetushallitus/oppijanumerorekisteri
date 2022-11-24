import {
    FETCH_TUONTIKOOSTE_REQUEST,
    FETCH_TUONTIKOOSTE_SUCCESS,
    FETCH_TUONTIKOOSTE_FAILURE,
} from '../actions/actiontypes';
import { TuontiKoosteAction } from '../actions/tuontikooste.actions';
import type { TuontiKooste } from '../types/tuontikooste.types';

export type TuontiKoosteState = {
    loading: boolean;
    payload?: TuontiKooste;
};

export const initialState = {
    loading: false,
    payload: undefined,
};

export const tuontiKoosteReducer = (
    state: TuontiKoosteState = initialState,
    action: TuontiKoosteAction
): TuontiKoosteState => {
    switch (action.type) {
        case FETCH_TUONTIKOOSTE_REQUEST:
            return {
                loading: true,
                payload: undefined,
            };
        case FETCH_TUONTIKOOSTE_SUCCESS:
            return {
                loading: false,
                payload: action.payload,
            };
        case FETCH_TUONTIKOOSTE_FAILURE:
            return initialState;
        default:
            return state;
    }
};
