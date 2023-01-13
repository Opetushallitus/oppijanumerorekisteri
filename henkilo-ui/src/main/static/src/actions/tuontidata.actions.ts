import { http } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { FETCH_TUONTIDATA_REQUEST, FETCH_TUONTIDATA_SUCCESS, FETCH_TUONTIDATA_FAILURE } from './actiontypes';
import { Tuontidata } from '../types/tuontidata.types';

type RequestAction = {
    type: typeof FETCH_TUONTIDATA_REQUEST;
};

type SuccessAction = {
    type: typeof FETCH_TUONTIDATA_SUCCESS;
    payload: Tuontidata[];
};

type FailureAction = {
    type: typeof FETCH_TUONTIDATA_FAILURE;
};

export type TuontidataAction = RequestAction | SuccessAction | FailureAction | never;

const requestTuontidata = (): RequestAction => ({
    type: FETCH_TUONTIDATA_REQUEST,
});

const requestTuontidataSuccess = (payload: Tuontidata[]): SuccessAction => ({
    type: FETCH_TUONTIDATA_SUCCESS,
    payload,
});

const requestTuontidataFailure = (): FailureAction => ({
    type: FETCH_TUONTIDATA_FAILURE,
});

export const fetchTuontidata = (tuontiId: number) => async (dispatch, state: () => any) => {
    dispatch(requestTuontidata());
    try {
        const url = urls.url('oppijanumerorekisteri-service.oppija.tuontidata');
        const payload = await http.get<Tuontidata[]>(`${url}/${tuontiId}`);
        dispatch(requestTuontidataSuccess(payload));
    } catch (error) {
        dispatch(requestTuontidataFailure());
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
