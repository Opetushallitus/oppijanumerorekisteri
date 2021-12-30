import { fetchAccessRightsReport, clearAccessRightsReport } from './report.actions';
import {
    CLEAR_ACCESS_RIGHT_REPORT,
    FETCH_ACCESS_RIGHT_REPORT_REQUEST,
    FETCH_ACCESS_RIGHT_REPORT_SUCCESS,
    FETCH_ACCESS_RIGHT_REPORT_FAILURE,
} from './actiontypes';
import { http } from '../http';

jest.mock('oph-urls-js');
jest.mock('../http');

afterAll(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    jest.resetAllMocks();
});

describe('Access rights report action creator', () => {
    const dispatch = jest.fn();
    const actionCreator = fetchAccessRightsReport('oid');

    test('Fetches data', async () => {
        http.get = jest.fn().mockResolvedValue([]);

        await actionCreator(dispatch);

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_ACCESS_RIGHT_REPORT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_ACCESS_RIGHT_REPORT_SUCCESS);
    });

    test('Handles data fetching errors', () => {
        http.get = jest.fn(() => {
            throw new Error('BOOM!');
        });

        actionCreator(dispatch);

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_ACCESS_RIGHT_REPORT_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_ACCESS_RIGHT_REPORT_FAILURE);
    });

    test('Clears store', () => {
        expect(clearAccessRightsReport().type).toBe(CLEAR_ACCESS_RIGHT_REPORT);
    });
});
