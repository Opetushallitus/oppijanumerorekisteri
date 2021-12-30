import {
    CLEAR_ACCESS_RIGHT_REPORT,
    FETCH_ACCESS_RIGHT_REPORT_REQUEST,
    FETCH_ACCESS_RIGHT_REPORT_SUCCESS,
    FETCH_ACCESS_RIGHT_REPORT_FAILURE,
} from '../actions/actiontypes';

export type AccessRightsReportRow = {};

export type ClearAction = {
    type: typeof CLEAR_ACCESS_RIGHT_REPORT;
};

export type RequestAction = {
    type: typeof FETCH_ACCESS_RIGHT_REPORT_REQUEST;
};

export type SuccessAction = {
    type: typeof FETCH_ACCESS_RIGHT_REPORT_SUCCESS;
    report: AccessRightsReportRow[];
};

export type FailureAction = {
    type: typeof FETCH_ACCESS_RIGHT_REPORT_FAILURE;
};

export type AccessRightsReportState = {
    reportLoading: boolean;
    reportData?: AccessRightsReportRow[];
};

const initialState = {
    reportLoading: false,
    reportData: undefined,
};

export const reportReducer = (
    state: AccessRightsReportState = initialState,
    action: ClearAction | RequestAction | SuccessAction | FailureAction | never
): AccessRightsReportState => {
    switch (action.type) {
        case FETCH_ACCESS_RIGHT_REPORT_REQUEST:
            return {
                reportLoading: true,
                reportData: undefined,
            };
        case FETCH_ACCESS_RIGHT_REPORT_SUCCESS:
            return {
                reportLoading: false,
                reportData: action.report,
            };
        case FETCH_ACCESS_RIGHT_REPORT_FAILURE:
            return initialState;
        case CLEAR_ACCESS_RIGHT_REPORT:
            return initialState;
        default:
            return state;
    }
};
