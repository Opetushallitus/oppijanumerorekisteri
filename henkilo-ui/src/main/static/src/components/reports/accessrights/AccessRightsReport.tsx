import React from 'react';
import { connect } from 'react-redux';
import { L10n } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import Controls from './AccessRightsReportControls';
import Report from './AccessRightsReportData';

type Props = {
    l10n: L10n;
    locale: Locale;
};

const Header: React.FC<{ translate: (string) => string }> = ({ translate }) => (
    <div className="flex-horizontal">
        <span className="oph-h2 oph-bold">{translate('TITLE_RAPORTTI_KAYTTOOIKEUS')}</span>
    </div>
);

const AccessRightsReport: React.FC<Props> = ({ l10n, locale }) => {
    const translate = (key: string) => l10n[locale][key] || key;

    return (
        <div className="wrapper">
            <Header translate={translate} />
            <Controls />
            <Report />
        </div>
    );
};

const mapStateToProps = (state) => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
});

export default connect<Props>(mapStateToProps, {})(AccessRightsReport);
