import { doExistenceCheck, clearExistenceCheck } from './existence.actions';
import {
    CLEAR_EXISTENCE_CHECK,
    FETCH_EXISTENCE_CHECK_REQUEST,
    FETCH_EXISTENCE_CHECK_SUCCESS,
    FETCH_EXISTENCE_CHECK_FAILURE,
} from './actiontypes';
import { httpWithStatus } from '../http';

jest.mock('oph-urls-js');
jest.mock('../http');
jest.mock('../utilities/localisation.util');

afterAll(() => {
    jest.clearAllMocks();
});

beforeEach(() => {
    jest.resetAllMocks();
});

describe('Existence check action creator', () => {
    const dispatch = jest.fn();
    const actionCreator = doExistenceCheck({ hetu: '', etunimet: '', kutsumanimi: '', sukunimi: '' });

    test('Fetches data', async () => {
        httpWithStatus.post = jest.fn().mockResolvedValue([{ oid: '' }, 204]);

        await actionCreator(dispatch, () => {});

        expect(httpWithStatus.post).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_EXISTENCE_CHECK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_EXISTENCE_CHECK_SUCCESS);
    });

    test('Handles data fetching errors', () => {
        httpWithStatus.post = jest.fn(() => {
            throw new Error('BOOM!');
        });

        actionCreator(dispatch, () => {});

        expect(httpWithStatus.post).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(FETCH_EXISTENCE_CHECK_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(FETCH_EXISTENCE_CHECK_FAILURE);
        expect(dispatch.mock.calls[2][0]).toEqual(expect.any(Function));
    });

    test('Clears store', () => {
        expect(clearExistenceCheck().type).toBe(CLEAR_EXISTENCE_CHECK);
    });
});
