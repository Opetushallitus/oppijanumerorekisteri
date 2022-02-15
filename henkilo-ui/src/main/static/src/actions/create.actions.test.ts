import { createPerson } from './create.actions';
import { CREATE_PERSON_REQUEST, CREATE_PERSON_SUCCESS, CREATE_PERSON_FAILURE } from './actiontypes';
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

describe('Create person action creator', () => {
    const dispatch = jest.fn();
    const actionCreator = createPerson({ hetu: '', etunimet: '', kutsumanimi: '', sukunimi: '' });

    test('Create person with given data', async () => {
        httpWithStatus.post = jest.fn().mockResolvedValue(['oid', 201]);

        await actionCreator(dispatch, () => {});

        expect(httpWithStatus.post).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0].type).toBe(CREATE_PERSON_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(CREATE_PERSON_SUCCESS);
    });

    test('Handles errors', () => {
        httpWithStatus.post = jest.fn(() => {
            throw new Error('BOOM!');
        });

        actionCreator(dispatch, () => {});

        expect(httpWithStatus.post).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0].type).toBe(CREATE_PERSON_REQUEST);
        expect(dispatch.mock.calls[1][0].type).toBe(CREATE_PERSON_FAILURE);
        expect(dispatch.mock.calls[2][0]).toEqual(expect.any(Function));
    });
});
