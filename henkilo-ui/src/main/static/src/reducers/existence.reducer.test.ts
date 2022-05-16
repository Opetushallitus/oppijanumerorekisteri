// @ts-nocheck
import reducer, { initialState, statusToMessage } from './existence.reducer';
import {
    CLEAR_EXISTENCE_CHECK,
    FETCH_EXISTENCE_CHECK_REQUEST,
    FETCH_EXISTENCE_CHECK_SUCCESS,
    FETCH_EXISTENCE_CHECK_FAILURE,
} from '../actions/actiontypes';

describe('Existence check reducer', () => {
    test.each([
        [{}, initialState], // simulate redux init action
        [{ type: CLEAR_EXISTENCE_CHECK }, initialState],
        [{ type: FETCH_EXISTENCE_CHECK_REQUEST }, { ...initialState, loading: true }],
        [
            { type: FETCH_EXISTENCE_CHECK_SUCCESS, data: { oid: 'oid' }, status: 204 },
            { loading: false, oid: 'oid', msgKey: statusToMessage[204], status: 204 },
        ],
        [{ type: FETCH_EXISTENCE_CHECK_FAILURE, status: 500 }, { ...initialState }],
    ])('Resolves state correctly when action is "%s"', (action, expectedState) =>
        expect(reducer(undefined, action)).toEqual(expectedState)
    );
});
