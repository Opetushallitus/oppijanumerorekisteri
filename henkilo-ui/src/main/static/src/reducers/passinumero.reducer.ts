import {
    FETCH_PASSINUMEROT_REQUEST,
    FETCH_PASSINUMEROT_SUCCESS,
    FETCH_PASSINUMEROT_FAILURE,
} from '../actions/actiontypes';
import { PassinumeroAction } from '../actions/passinumerot.actions';

export type PassinumeroState = {
    loading: boolean;
    payload: string[];
};

export const initialState = {
    loading: false,
    payload: [],
};

export const passinumeroReducer = (
    state: PassinumeroState = initialState,
    action: PassinumeroAction
): PassinumeroState => {
    switch (action.type) {
        case FETCH_PASSINUMEROT_REQUEST:
            return {
                loading: true,
                payload: [],
            };
        case FETCH_PASSINUMEROT_SUCCESS:
            return {
                loading: false,
                payload: [...action.payload].sort(),
            };
        case FETCH_PASSINUMEROT_FAILURE:
            return initialState;
        default:
            return state;
    }
};
