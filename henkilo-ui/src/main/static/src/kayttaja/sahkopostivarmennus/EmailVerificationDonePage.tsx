import React from 'react';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';
import { useParams } from 'react-router';

export const EmailVerificationDonePage = () => {
    const { l10n } = useLocalisations();
    const params = useParams();
    const locale = toSupportedLocale(params.locale);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_SAHKOPOSTI_VARMISTAMINEN']);

    return (
        <div className="infoPageWrapper" id="email-verification-page">
            <h2 className="oph-h2 oph-bold">{L['SAHKOPOSTI_VARMENNUS_ONNISTUI_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>{L['SAHKOPOSTI_VARMENNUS_ONNISTUI_TEKSTI']}</p>
            <a href="/">{L['LINKKI_VIRKAILIJA_OPINTOPOLUN_ETUSIVULLE']}</a>
        </div>
    );
};
