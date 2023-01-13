// @ts-nocheck
import { tuontidataReducer, initialState } from './tuontidata.reducer';
import { FETCH_TUONTIDATA_REQUEST, FETCH_TUONTIDATA_SUCCESS, FETCH_TUONTIDATA_FAILURE } from '../actions/actiontypes';

describe('Tuontidata reducer', () => {
    test.each([
        [{}, initialState],
        [{ type: FETCH_TUONTIDATA_REQUEST }, { loading: true }],
        [
            { type: FETCH_TUONTIDATA_SUCCESS, payload: [] },
            { loading: false, payload: [] },
        ],
        [{ type: FETCH_TUONTIDATA_FAILURE }, initialState],
    ])('Resolves state correctly when action is "%s"', (action, expectedState) =>
        expect(tuontidataReducer(undefined, action)).toEqual(expectedState)
    );
});
