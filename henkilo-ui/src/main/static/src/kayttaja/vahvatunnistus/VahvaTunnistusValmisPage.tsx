import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

export const VahvaTunnistusValmisPage = () => {
    const { l10n } = useLocalisations();
    const params = useParams();
    const locale = toSupportedLocale(params.locale);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN']);

    return (
        <div className="infoPageWrapper" id="strong-identification-page">
            <h2 className="oph-h2 oph-bold">{L['VAHVA_TUNNISTUS_ONNISTUI_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>{L['VAHVA_TUNNISTUS_ONNISTUI_TEKSTI']}</p>
            <a href="/">{L['LINKKI_VIRKAILIJA_OPINTOPOLUN_ETUSIVULLE']}</a>
        </div>
    );
};
