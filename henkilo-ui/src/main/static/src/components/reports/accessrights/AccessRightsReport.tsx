import React from 'react';
import { connect } from 'react-redux';
import type { L10n } from '../../../types/localisation.type';
import type { Locale } from '../../../types/locale.type';
import type { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import type { AccessRightsReportRow } from '../../../reducers/report.reducer';
import type { RootState } from '../../../reducers';
import { fetchOmattiedotOrganisaatios } from '../../../actions/omattiedot.actions';
import { fetchAccessRightsReport, clearAccessRightsReport } from '../../../actions/report.actions';
import Loader from '../../common/icons/Loader';
import Controls from './AccessRightsReportControls';
import Report, { columns } from './AccessRightsReportData';
import exportReport from './exportUtil';

type DispatchProps = {
    fetchOrgs: () => void;
    fetchReport: (string) => void;
    clearReport: () => void;
};

type StateProps = {
    l10n: L10n;
    locale: Locale;
    organisationsLoading: boolean;
    organisations: OrganisaatioHenkilo[];
    reportLoading: boolean;
    reportData?: AccessRightsReportRow[];
};

type Props = DispatchProps & StateProps;

const Header: React.FC<{ translate: (string) => string }> = ({ translate }) => (
    <div className="flex-horizontal">
        <span className="oph-h2 oph-bold henkilohaku-main-header">{translate('KAYTTOOIKEUSRAPORTTI_TITLE')}</span>
    </div>
);

export const AccessRightsReport: React.FC<Props> = ({
    l10n,
    locale,
    organisationsLoading,
    organisations,
    reportLoading,
    reportData,
    fetchOrgs,
    fetchReport,
    clearReport,
}) => {
    const [oid, setOid] = React.useState<string>(undefined);
    const [filter, setFilter] = React.useState<string>(undefined);
    const [filterValues, setFilterValues] = React.useState<string[]>([]);

    React.useEffect(() => {
        fetchOrgs();
    }, [fetchOrgs]);

    React.useEffect(() => {
        clearReport();
        oid && fetchReport(oid);
    }, [clearReport, fetchReport, oid]);

    React.useEffect(() => {
        setFilter(undefined);
        setFilterValues([...new Set((reportData || []).map((row) => row.accessRightName))]);
    }, [reportData]);

    const translate = (key: string) => l10n[locale][key] || key;

    const report = reportData && reportData.filter((row) => !filter || row.accessRightName === filter);

    return (
        <div className="wrapper">
            <Header translate={translate} />
            <Controls
                locale={locale}
                L={l10n[locale]}
                organisations={organisations}
                disabled={organisationsLoading || reportLoading}
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
    organisationsLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
    organisations: state.omattiedot.organisaatios,
    reportLoading: state.report.reportLoading,
    reportData: state.report.reportData,
});

const mapDispatchToProps: DispatchProps = {
    fetchOrgs: fetchOmattiedotOrganisaatios,
    fetchReport: fetchAccessRightsReport,
    clearReport: clearAccessRightsReport,
};

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(AccessRightsReport);
