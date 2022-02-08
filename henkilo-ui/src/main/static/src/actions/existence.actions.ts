import { httpWithStatus } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import {
    CLEAR_EXISTENCE_CHECK,
    FETCH_EXISTENCE_CHECK_REQUEST,
    FETCH_EXISTENCE_CHECK_SUCCESS,
    FETCH_EXISTENCE_CHECK_FAILURE,
} from './actiontypes';
import type {
    ExistenceCheckRequest,
    ExistenceCheckReponse,
    ClearAction,
    RequestAction,
    SuccessAction,
    FailureAction,
} from '../reducers/existence.reducer';

export const clearExistenceCheck = (): ClearAction => ({
    type: CLEAR_EXISTENCE_CHECK,
});

const requestExistenceCheck = (): RequestAction => ({
    type: FETCH_EXISTENCE_CHECK_REQUEST,
});
const requestExistenceCheckSuccess = (data: ExistenceCheckReponse, status: number): SuccessAction => ({
    type: FETCH_EXISTENCE_CHECK_SUCCESS,
    data,
    status,
});
const requestExistenceCheckFailure = (status: number): FailureAction => ({
    type: FETCH_EXISTENCE_CHECK_FAILURE,
    status,
});

export const doExistenceCheck = (payload: ExistenceCheckRequest) => async (dispatch, state: () => any) => {
    dispatch(requestExistenceCheck());
    try {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.exists');
        const [data, status] = await httpWithStatus.post<ExistenceCheckReponse>(url, payload);
        dispatch(requestExistenceCheckSuccess(data, status));
    } catch (error) {
        dispatch(requestExistenceCheckFailure(500));
        dispatch(
            addGlobalNotification({
                key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                title: localizeWithState('KAYTTOOIKEUSRAPORTTI_ERROR', state()),
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            })
        );
    }
};
