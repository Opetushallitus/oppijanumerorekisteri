import React from 'react';

import VirhePage from '../VirhePage';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { useParams } from 'react-router';

const EmailVerificationErrorContainer = () => {
    const { getLocalisations } = useLocalisations();
    const params = useParams();
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_VIRHESIVU']);
    if (params.virhekoodi === 'TOKEN_KAYTETTY') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (params.virhekoodi === 'TOKEN_VANHENTUNUT') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (params.virhekoodi === 'TOKEN_EI_LOYDY') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (params.virhekoodi === 'UNKNOWN') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else {
        return (
            <div className="virhePageVirheWrapperGray" id="virhePageVirhe">
                <p className="oph-h2 oph-bold oph-red">{L['SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_OTSIKKO']}</p>
                <p className="oph-bold">{L['SAHKOPOSTI_VARMENNUS_TOKEN_YLEINEN_VIRHE_TEKSTI']}</p>
            </div>
        );
    }
};

export default EmailVerificationErrorContainer;
