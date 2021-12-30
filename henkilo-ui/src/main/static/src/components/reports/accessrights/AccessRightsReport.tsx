import React, { useState } from 'react';
import { connect } from 'react-redux';
import { L10n } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { OrganisaatioHenkilo } from '../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { fetchOmattiedotOrganisaatios } from '../../../actions/omattiedot.actions';
import Controls from './AccessRightsReportControls';
import Report from './AccessRightsReportData';

type Props = {
    l10n: L10n;
    locale: Locale;
    fetchOmattiedotOrganisaatios: () => void;
    organisationsLoading: boolean;
    organisations: OrganisaatioHenkilo[];
};

const Header: React.FC<{ translate: (string) => string }> = ({ translate }) => (
    <div className="flex-horizontal">
        <span className="oph-h2 oph-bold">{translate('TITLE_RAPORTTI_KAYTTOOIKEUS')}</span>
    </div>
);

const AccessRightsReport: React.FC<Props> = ({
    l10n,
    locale,
    fetchOmattiedotOrganisaatios,
    organisationsLoading,
    organisations,
}) => {
    const [oid, setOid] = useState<string>(undefined);

    const translate = (key: string) => l10n[locale][key] || key;

    React.useEffect(() => {
        fetchOmattiedotOrganisaatios();
    }, [fetchOmattiedotOrganisaatios]);

    return (
        <div className="wrapper">
            <b>{oid}</b>
            <Header translate={translate} />
            <Controls
                locale={locale}
                L={l10n[locale]}
                organisaatiot={organisations}
                disabled={organisationsLoading}
                setOid={setOid}
            />
            <Report />
        </div>
    );
};

const mapStateToProps = (state): Partial<Props> => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    organisationsLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
    organisations: state.omattiedot.organisaatios,
});

const mapDispatchToProps: Partial<Props> = {
    fetchOmattiedotOrganisaatios,
};

export default connect<Props>(mapStateToProps, mapDispatchToProps)(AccessRightsReport);
