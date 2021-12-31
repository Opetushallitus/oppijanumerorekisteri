import React, { useState, useEffect } from 'react';
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
import Report from './AccessRightsReportData';

type Props = {
    l10n: L10n;
    locale: Locale;
    fetchOmattiedotOrganisaatios: () => void;
    fetchAccessRightsReport: (string) => void;
    clearAccessRightsReport: () => void;
    organisationsLoading: boolean;
    organisations: OrganisaatioHenkilo[];
    reportLoading: boolean;
    reportData?: AccessRightsReportRow[];
};

const Header: React.FC<{ translate: (string) => string }> = ({ translate }) => (
    <div className="flex-horizontal">
        <span className="oph-h2 oph-bold">{translate('KAYTTOOIKEUSRAPORTTI_TITLE')}</span>
    </div>
);

const AccessRightsReport: React.FC<Props> = ({
    l10n,
    locale,
    fetchOmattiedotOrganisaatios,
    fetchAccessRightsReport,
    clearAccessRightsReport,
    organisationsLoading,
    organisations,
    reportLoading,
    reportData,
}) => {
    const [oid, setOid] = useState<string>(undefined);

    React.useEffect(() => {
        fetchOmattiedotOrganisaatios();
    }, [fetchOmattiedotOrganisaatios]);

    useEffect(() => {
        clearAccessRightsReport();
        oid && fetchAccessRightsReport(oid);
    }, [clearAccessRightsReport, fetchAccessRightsReport, oid]);

    const translate = (key: string) => l10n[locale][key] || key;

    return (
        <div className="wrapper">
            <Header translate={translate} />
            <Controls
                locale={locale}
                L={l10n[locale]}
                organisaatiot={organisations}
                disabled={organisationsLoading || reportLoading}
                setOid={setOid}
            />
            {oid && (reportLoading ? <Loader /> : <Report reportData={reportData} translate={translate} />)}
        </div>
    );
};

const mapStateToProps = (state: RootState): Partial<Props> => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    organisationsLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
    organisations: state.omattiedot.organisaatios,
    reportLoading: state.report.reportLoading,
    reportData: state.report.reportData,
});

const mapDispatchToProps: Partial<Props> = {
    fetchOmattiedotOrganisaatios,
    fetchAccessRightsReport,
    clearAccessRightsReport,
};

export default connect<Props>(mapStateToProps, mapDispatchToProps)(AccessRightsReport);
