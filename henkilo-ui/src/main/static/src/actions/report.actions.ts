import { http } from '../http';
import { urls } from 'oph-urls-js';
import { addGlobalNotification } from './notification.actions';
import { localizeWithState } from '../utilities/localisation.util';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import {
    CLEAR_ACCESS_RIGHT_REPORT,
    FETCH_ACCESS_RIGHT_REPORT_REQUEST,
    FETCH_ACCESS_RIGHT_REPORT_SUCCESS,
    FETCH_ACCESS_RIGHT_REPORT_FAILURE,
} from './actiontypes';
import type {
    AccessRightsReportRow,
    ClearAction,
    RequestAction,
    SuccessAction,
    FailureAction,
} from '../reducers/report.reducer';
import { AppDispatch } from '../store';

export const clearAccessRightsReport = (): ClearAction => ({
    type: CLEAR_ACCESS_RIGHT_REPORT,
});

const requestAccessRightsReport = (): RequestAction => ({
    type: FETCH_ACCESS_RIGHT_REPORT_REQUEST,
});
const requestAccessRightsReportSuccess = (report: AccessRightsReportRow[]): SuccessAction => ({
    type: FETCH_ACCESS_RIGHT_REPORT_SUCCESS,
    report,
});
const requestAccessRightsReportFailure = (): FailureAction => ({
    type: FETCH_ACCESS_RIGHT_REPORT_FAILURE,
});

export const fetchAccessRightsReport = (oid: string) => async (dispatch: AppDispatch, state: () => any) => {
    dispatch(requestAccessRightsReport());
    try {
        const url = urls.url('kayttooikeus-service.report.access-rights-for-organisaatio', oid);
        const report = await http.get<AccessRightsReportRow[]>(url);
        dispatch(requestAccessRightsReportSuccess(report));
    } catch (error) {
        dispatch(requestAccessRightsReportFailure());
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
