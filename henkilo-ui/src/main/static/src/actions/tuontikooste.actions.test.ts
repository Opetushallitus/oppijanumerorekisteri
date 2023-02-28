import { fetchTuontiKooste } from './tuontikooste.actions';
import { FETCH_TUONTIKOOSTE_REQUEST, FETCH_TUONTIKOOSTE_SUCCESS, FETCH_TUONTIKOOSTE_FAILURE } from './actiontypes';
import { http } from '../http';
import { TuontiKoosteCriteria } from '../types/tuontikooste.types';

jest.mock('oph-urls-js');
jest.mock('../http');
jest.mock('../utilities/localisation.util');

const criteria: TuontiKoosteCriteria = {
    page: 1,
    pageSize: 1,
    field: 'timestamp',
    sort: 'ASC',
};

afterAll(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    jest.resetAllMocks();
});

describe('Tuontikooste action creator', () => {
    const dispatch = jest.fn();
    const actionCreator = fetchTuontiKooste(criteria);

    test('Fetch data', async () => {
        http.get = jest.fn().mockResolvedValue([]);

        await actionCreator(dispatch, () => {});

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_TUONTIKOOSTE_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_TUONTIKOOSTE_SUCCESS);
    });

    test('Handle errors', () => {
        http.get = jest.fn(() => {
            throw new Error('BOOM!');
        });

        actionCreator(dispatch, () => {});

        expect(http.get).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_TUONTIKOOSTE_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_TUONTIKOOSTE_FAILURE);
        expect(dispatch.mock.calls[2][0]).toEqual(expect.any(Function));
    });
});
