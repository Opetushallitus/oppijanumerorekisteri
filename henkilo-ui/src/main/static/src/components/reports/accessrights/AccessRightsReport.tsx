import React from 'react';
import { connect } from 'react-redux';
import type { AccessRightsReportRow } from '../../../reducers/report.reducer';
import type { RootState } from '../../../store';
import { fetchAccessRightsReport, clearAccessRightsReport } from '../../../actions/report.actions';
import Loader from '../../common/icons/Loader';
import Controls from './AccessRightsReportControls';
import Report from './AccessRightsReportData';
import exportReport from './exportUtil';
import { useLocalisations } from '../../../selectors';

type DispatchProps = {
    fetchReport: (oid: string) => void;
    clearReport: () => void;
};

type StateProps = {
    reportLoading: boolean;
    reportData?: AccessRightsReportRow[];
};

type Props = DispatchProps & StateProps;

export const AccessRightsReport: React.FC<Props> = ({ reportLoading, reportData, fetchReport, clearReport }) => {
    const [oid, setOid] = React.useState<string>(undefined);
    const [filter, setFilter] = React.useState<string>(undefined);
    const [filterValues, setFilterValues] = React.useState<string[]>([]);
    const { L } = useLocalisations();

    React.useEffect(() => {
        clearReport();
        oid && fetchReport(oid);
    }, [clearReport, fetchReport, oid]);

    React.useEffect(() => {
        setFilter(undefined);
        setFilterValues([...new Set((reportData || []).map((row) => row.accessRightName))]);
    }, [reportData]);

    const report = React.useMemo(
        () => reportData && reportData.filter((row) => !filter || row.accessRightName === filter),
        [reportData, filter]
    );

    return (
        <div className="wrapper">
            <div className="flex-horizontal">
                <span className="oph-h2 oph-bold henkilohaku-main-header">{L['KAYTTOOIKEUSRAPORTTI_TITLE']}</span>
            </div>
            <Controls
                disabled={reportLoading}
                filterValues={filterValues}
                filter={filter}
                setFilter={setFilter}
                setOid={setOid}
                dataExport={report && report[0] && (() => exportReport(report, L))}
            />
            {reportLoading && <Loader />}
            {report && <Report report={report} />}
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    reportLoading: state.report.reportLoading,
    reportData: state.report.reportData,
});

const mapDispatchToProps: DispatchProps = {
    fetchReport: fetchAccessRightsReport,
    clearReport: clearAccessRightsReport,
};

export default connect<StateProps, DispatchProps, never, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(AccessRightsReport);
