// @ts-nocheck
import { reportReducer } from './report.reducer';
import {
    CLEAR_ACCESS_RIGHT_REPORT,
    FETCH_ACCESS_RIGHT_REPORT_REQUEST,
    FETCH_ACCESS_RIGHT_REPORT_SUCCESS,
    FETCH_ACCESS_RIGHT_REPORT_FAILURE,
} from '../actions/actiontypes';

describe('Report reducer', () => {
    test.each([
        [{}, { reportLoading: false }], // simulate redux init action
        [{ type: CLEAR_ACCESS_RIGHT_REPORT }, { reportLoading: false }],
        [{ type: FETCH_ACCESS_RIGHT_REPORT_REQUEST }, { reportLoading: true }],
        [
            { type: FETCH_ACCESS_RIGHT_REPORT_SUCCESS, report: [] },
            { reportLoading: false, reportData: [] },
        ],
        [{ type: FETCH_ACCESS_RIGHT_REPORT_FAILURE }, { reportLoading: false }],
    ])('Resolves state correctly when action is "%s"', (action, expectedState) =>
        expect(reportReducer(undefined, action)).toEqual(expectedState)
    );
});
