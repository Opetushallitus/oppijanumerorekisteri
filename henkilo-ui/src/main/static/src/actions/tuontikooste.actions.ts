import { http } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { FETCH_TUONTIKOOSTE_REQUEST, FETCH_TUONTIKOOSTE_SUCCESS, FETCH_TUONTIKOOSTE_FAILURE } from './actiontypes';
import { TuontiKooste, TuontiKoosteCriteria } from '../types/tuontikooste.types';
import { AppDispatch } from '../store';

type RequestAction = {
    type: typeof FETCH_TUONTIKOOSTE_REQUEST;
};

type SuccessAction = {
    type: typeof FETCH_TUONTIKOOSTE_SUCCESS;
    payload: TuontiKooste;
};

type FailureAction = {
    type: typeof FETCH_TUONTIKOOSTE_FAILURE;
};

export type TuontiKoosteAction = RequestAction | SuccessAction | FailureAction | never;

const requestTuontiKooste = (): RequestAction => ({
    type: FETCH_TUONTIKOOSTE_REQUEST,
});

const requestTuontiKoosteSuccess = (payload: TuontiKooste): SuccessAction => ({
    type: FETCH_TUONTIKOOSTE_SUCCESS,
    payload,
});

const requestTuontiKoosteFailure = (): FailureAction => ({
    type: FETCH_TUONTIKOOSTE_FAILURE,
});

export const fetchTuontiKooste =
    (criteria: TuontiKoosteCriteria) => async (dispatch: AppDispatch, state: () => any) => {
        dispatch(requestTuontiKooste());
        try {
            const query = new URLSearchParams(criteria as unknown as Record<string, string>).toString();
            const url = urls.url('oppijanumerorekisteri-service.oppija.tuontikooste');
            const payload = await http.get<TuontiKooste>(`${url}?${query}`);
            dispatch(requestTuontiKoosteSuccess(payload));
        } catch (error) {
            dispatch(requestTuontiKoosteFailure());
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
