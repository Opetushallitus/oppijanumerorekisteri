import { FETCH_TUONTIDATA_REQUEST, FETCH_TUONTIDATA_SUCCESS, FETCH_TUONTIDATA_FAILURE } from '../actions/actiontypes';
import { TuontidataAction } from '../actions/tuontidata.actions';
import type { Tuontidata } from '../types/tuontidata.types';

export type TuontidataState = {
    loading: boolean;
    payload?: Tuontidata[];
};

export const initialState = {
    loading: false,
    payload: undefined,
};

export const tuontidataReducer = (state: TuontidataState = initialState, action: TuontidataAction): TuontidataState => {
    switch (action.type) {
        case FETCH_TUONTIDATA_REQUEST:
            return {
                loading: true,
                payload: undefined,
            };
        case FETCH_TUONTIDATA_SUCCESS:
            return {
                loading: false,
                payload: action.payload,
            };
        case FETCH_TUONTIDATA_FAILURE:
            return initialState;
        default:
            return state;
    }
};
