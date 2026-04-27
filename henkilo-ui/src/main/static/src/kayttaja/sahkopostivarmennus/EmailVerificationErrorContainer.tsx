import React from 'react';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { useParams } from 'react-router';
import { OphDsErrorPage } from '../../components/design-system/OphDsErrorPage';

const EmailVerificationErrorContainer = () => {
    const { getLocalisations } = useLocalisations();
    const params = useParams();
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_VIRHESIVU']);
    if (params.virhekoodi === 'TOKEN_KAYTETTY') {
        return (
            <OphDsErrorPage header={L['SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_OTSIKKO']!}>
                <p>{L['SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_TEKSTI']}</p>
                <p>
                    <a href="/">{L['SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE']}</a>
                </p>
            </OphDsErrorPage>
        );
    } else if (params.virhekoodi === 'TOKEN_VANHENTUNUT') {
        return (
            <OphDsErrorPage header={L['SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_OTSIKKO']!}>
                <p>{L['SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_TEKSTI']}</p>
                <p>
                    <a href="/">{L['SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE']}</a>
                </p>
            </OphDsErrorPage>
        );
    } else if (params.virhekoodi === 'TOKEN_EI_LOYDY') {
        return (
            <OphDsErrorPage header={L['SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_OTSIKKO']!}>
                <p>{L['SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_TEKSTI']}</p>
                <p>
                    <a href="/">{L['SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE']}</a>
                </p>
            </OphDsErrorPage>
        );
    } else {
        return (
            <OphDsErrorPage header={L['SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_OTSIKKO']!}>
                <p>{L['SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_TEKSTI']}</p>
                <p>
                    <a href="/">{L['SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE']}</a>
                </p>
            </OphDsErrorPage>
        );
    }
};

export default EmailVerificationErrorContainer;
