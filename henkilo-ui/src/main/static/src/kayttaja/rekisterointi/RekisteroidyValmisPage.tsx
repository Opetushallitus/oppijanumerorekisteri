import React from 'react';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

type Props = {
    params: {
        locale: string;
    };
};

export const RekisteroidyValmisPage = ({ params: { locale: anyLocale } }: Props) => {
    const { l10n } = useLocalisations();
    const locale = toSupportedLocale(anyLocale);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_REKISTEROINTI']);

    return (
        <div className="infoPageWrapper" id="rekisteroidy-page">
            <h2 className="oph-h2 oph-bold">{L['REKISTEROINTI_ONNISTUI_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>{L['REKISTEROINTI_ONNISTUI_TEKSTI']}</p>
            <a href="/">{L['LINKKI_VIRKAILIJA_OPINTOPOLUN_ETUSIVULLE']}</a>
        </div>
    );
};
