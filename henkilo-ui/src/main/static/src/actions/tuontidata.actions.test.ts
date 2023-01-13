import { fetchTuontidata } from './tuontidata.actions';
import { FETCH_TUONTIDATA_REQUEST, FETCH_TUONTIDATA_SUCCESS, FETCH_TUONTIDATA_FAILURE } from './actiontypes';
import { http } from '../http';

jest.mock('oph-urls-js');
jest.mock('../http');
jest.mock('../utilities/localisation.util');

afterAll(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    jest.resetAllMocks();
});

describe('Tuontidata action creator', () => {
    const dispatch = jest.fn();
    const actionCreator = fetchTuontidata(1);

    test('Fetch data', async () => {
        http.get = jest.fn().mockResolvedValue([]);

        await actionCreator(dispatch, () => {});

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_TUONTIDATA_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_TUONTIDATA_SUCCESS);
    });

    test('Handle errors', () => {
        http.get = jest.fn(() => {
            throw new Error('BOOM!');
        });

        actionCreator(dispatch, () => {});

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_TUONTIDATA_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_TUONTIDATA_FAILURE);
        expect(dispatch.mock.calls[2][0]).toEqual(expect.any(Function));
    });
});
