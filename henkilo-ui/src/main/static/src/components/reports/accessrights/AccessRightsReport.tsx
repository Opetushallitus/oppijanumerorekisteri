import React from 'react';
import { connect } from 'react-redux';
import type { L10n } from '../../../types/localisation.type';
import type { Locale } from '../../../types/locale.type';
import type { AccessRightsReportRow } from '../../../reducers/report.reducer';
import type { RootState } from '../../../store';
import { fetchAccessRightsReport, clearAccessRightsReport } from '../../../actions/report.actions';
import Loader from '../../common/icons/Loader';
import Controls from './AccessRightsReportControls';
import Report, { columns } from './AccessRightsReportData';
import exportReport from './exportUtil';

type DispatchProps = {
    fetchReport: (oid: string) => void;
    clearReport: () => void;
};

type StateProps = {
    l10n: L10n;
    locale: Locale;
    reportLoading: boolean;
    reportData?: AccessRightsReportRow[];
};

type Props = DispatchProps & StateProps;

const Header: React.FC<{ translate: (key: string) => string }> = ({ translate }) => (
    <div className="flex-horizontal">
        <span className="oph-h2 oph-bold henkilohaku-main-header">{translate('KAYTTOOIKEUSRAPORTTI_TITLE')}</span>
    </div>
);

export const AccessRightsReport: React.FC<Props> = ({
    l10n,
    locale,
    reportLoading,
    reportData,
    fetchReport,
    clearReport,
}) => {
    const [oid, setOid] = React.useState<string>(undefined);
    const [filter, setFilter] = React.useState<string>(undefined);
    const [filterValues, setFilterValues] = React.useState<string[]>([]);

    React.useEffect(() => {
        clearReport();
        oid && fetchReport(oid);
    }, [clearReport, fetchReport, oid]);

    React.useEffect(() => {
        setFilter(undefined);
        setFilterValues([...new Set((reportData || []).map((row) => row.accessRightName))]);
    }, [reportData]);

    const translate = (key: string) => l10n[locale][key] || key;

    const report = React.useMemo(
        () => reportData && reportData.filter((row) => !filter || row.accessRightName === filter),
        [reportData, filter]
    );

    return (
        <div className="wrapper">
            <Header translate={translate} />
            <Controls
                translate={translate}
                disabled={reportLoading}
                filterValues={filterValues}
                filter={filter}
                setFilter={setFilter}
                setOid={setOid}
                dataExport={report && report[0] && (() => exportReport(report, columns, translate))}
            />
            {oid && (reportLoading ? <Loader /> : <Report report={report} translate={translate} />)}
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    reportLoading: state.report.reportLoading,
    reportData: state.report.reportData,
});

const mapDispatchToProps: DispatchProps = {
    fetchReport: fetchAccessRightsReport,
    clearReport: clearAccessRightsReport,
};

export default connect<StateProps, DispatchProps, {}, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(AccessRightsReport);
