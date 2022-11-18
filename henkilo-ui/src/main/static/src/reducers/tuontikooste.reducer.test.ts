// @ts-nocheck
import { tuontiKoosteReducer, initialState } from './tuontikooste.reducer';
import {
    FETCH_TUONTIKOOSTE_REQUEST,
    FETCH_TUONTIKOOSTE_SUCCESS,
    FETCH_TUONTIKOOSTE_FAILURE,
} from '../actions/actiontypes';

describe('TuontiKooste reducer', () => {
    test.each([
        [{}, initialState],
        [{ type: FETCH_TUONTIKOOSTE_REQUEST }, { loading: true }],
        [
            { type: FETCH_TUONTIKOOSTE_SUCCESS, payload: {} },
            { loading: false, payload: {} },
        ],
        [{ type: FETCH_TUONTIKOOSTE_FAILURE }, initialState],
    ])('Resolves state correctly when action is "%s"', (action, expectedState) =>
        expect(tuontiKoosteReducer(undefined, action)).toEqual(expectedState)
    );
});
