import React from 'react';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

type Props = {
    params: {
        locale: string;
    };
};

export const EmailVerificationDonePage = ({ params: { locale: anyLocale } }: Props) => {
    const { l10n } = useLocalisations();
    const locale = toSupportedLocale(anyLocale);
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
