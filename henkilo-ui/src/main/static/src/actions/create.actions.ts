import { httpWithStatus } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { CREATE_PERSON_REQUEST, CREATE_PERSON_SUCCESS, CREATE_PERSON_FAILURE } from './actiontypes';
import type { ExistenceCheckRequest } from '../reducers/existence.reducer';
import type { RequestAction, SuccessAction, FailureAction } from '../reducers/create.reducer';
import { AppDispatch } from '../store';

const createPersonRequest = (): RequestAction => ({
    type: CREATE_PERSON_REQUEST,
});
const createPersonRequestSuccess = (oid: string, status: number): SuccessAction => ({
    type: CREATE_PERSON_SUCCESS,
    oid,
    status,
});
const createPersonRequestFailure = (status: number): FailureAction => ({
    type: CREATE_PERSON_FAILURE,
    status,
});

export const createPerson = (payload: ExistenceCheckRequest) => async (dispatch: AppDispatch, state: () => any) => {
    dispatch(createPersonRequest());
    try {
        const url = urls.url('oppijanumerorekisteri-service.henkilo');
        const [data, status] = await httpWithStatus.post<string>(url, payload);
        if (status === 201) {
            dispatch(createPersonRequestSuccess(data, status));
        } else {
            dispatch(createPersonRequestFailure(status));
        }
    } catch (error) {
        dispatch(createPersonRequestFailure(500));
        dispatch<any>(
            addGlobalNotification({
                key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                title: localizeWithState('KAYTTOOIKEUSRAPORTTI_ERROR', state()),
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            })
        );
    }
};
