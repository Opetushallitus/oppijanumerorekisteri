import { http } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { FETCH_PASSINUMEROT_REQUEST, FETCH_PASSINUMEROT_SUCCESS, FETCH_PASSINUMEROT_FAILURE } from './actiontypes';
import { AnyAction, Dispatch } from 'redux';

type ReadAction = {
    type: typeof FETCH_PASSINUMEROT_REQUEST;
};

type SuccessAction = {
    type: typeof FETCH_PASSINUMEROT_SUCCESS;
    payload: string[];
};

type FailureAction = {
    type: typeof FETCH_PASSINUMEROT_FAILURE;
};

export type PassinumeroAction = ReadAction | SuccessAction | FailureAction | never;

const read = (): ReadAction => ({
    type: FETCH_PASSINUMEROT_REQUEST,
});

const success = (payload: string[]): SuccessAction => ({
    type: FETCH_PASSINUMEROT_SUCCESS,
    payload,
});

const failure = (): FailureAction => ({
    type: FETCH_PASSINUMEROT_FAILURE,
});

const errorHandler = async (dispatch: Dispatch, state: () => any, fetchFn: () => Promise<string[]>) => {
    try {
        dispatch(read());
        const payload = await fetchFn();
        dispatch(success(payload));
    } catch (error) {
        dispatch(failure());
        dispatch(
            (addGlobalNotification({
                key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                title: localizeWithState('KAYTTOOIKEUSRAPORTTI_ERROR', state()),
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            }) as unknown) as AnyAction
        );
    }
};

export const readPassinumerot = (oid: string) => async (dispatch: Dispatch, state: () => any) => {
    errorHandler(dispatch, state, () => {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.passinumerot', oid);
        return http.get<string[]>(url);
    });
};

export const writePassinumerot = (oid: string, passinumerot: string[]) => (dispatch: Dispatch, state: () => any) =>
    errorHandler(dispatch, state, () => {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.passinumerot', oid);
        return http.post<string[]>(url, passinumerot);
    });
