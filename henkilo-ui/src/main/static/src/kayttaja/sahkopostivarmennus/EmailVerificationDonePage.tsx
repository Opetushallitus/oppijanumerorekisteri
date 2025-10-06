import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';

export const EmailVerificationDonePage = () => {
    const { getLocalisations } = useLocalisations();
    const params = useParams();
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_SAHKOPOSTI_VARMISTAMINEN']);

    return (
        <div className="infoPageWrapper" id="email-verification-page">
            <h2 className="oph-h2 oph-bold">{L['SAHKOPOSTI_VARMENNUS_ONNISTUI_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>{L['SAHKOPOSTI_VARMENNUS_ONNISTUI_TEKSTI']}</p>
            <a href="/">{L['LINKKI_VIRKAILIJA_OPINTOPOLUN_ETUSIVULLE']}</a>
        </div>
    );
};
