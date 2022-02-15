// @ts-nocheck
import reducer, { initialState } from './create.reducer';
import { CREATE_PERSON_REQUEST, CREATE_PERSON_SUCCESS, CREATE_PERSON_FAILURE } from '../actions/actiontypes';

describe('Create person reducer', () => {
    test.each([
        [{}, initialState], // simulate redux init action
        [{ type: CREATE_PERSON_REQUEST }, { ...initialState, loading: true }],
        [
            { type: CREATE_PERSON_SUCCESS, oid: 'oid', status: 201 },
            { loading: false, oid: 'oid', status: 201 },
        ],
        [
            { type: CREATE_PERSON_FAILURE, status: 500 },
            { ...initialState, status: 500 },
        ],
    ])('Resolves state correctly when action is "%s"', (action, expectedState) =>
        expect(reducer(undefined, action)).toEqual(expectedState)
    );
});
