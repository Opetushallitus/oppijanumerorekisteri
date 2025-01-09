import React from 'react';
import { RouteActions } from 'react-router-redux';
import { urls } from 'oph-urls-js';

import { Locale } from '../../types/locale.type';
import VirhePage from '../../components/common/page/VirhePage';
import Button from '../../components/common/button/Button';
import { http } from '../../http';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';

type OwnProps = {
    params: { locale?: Locale; loginToken?: string; virhekoodi?: string };
    router: RouteActions;
};

const EmailVerificationErrorContainer = ({ params, router }: OwnProps) => {
    const { l10n } = useLocalisations();
    const L = l10n.localisations[params.locale ?? 'fi'];

    useTitle(L['TITLE_VIRHESIVU']);

    const redirectToFrontPage = async () => {
        try {
            const url = urls.url('kayttooikeus-service.cas.logintoken.redirectToFrontpage', params.loginToken);
            const redirectParams = await http.get(url);
            const redirectUrl = urls.url('cas.login', redirectParams);
            window.location.replace(redirectUrl);
        } catch (_error) {
            router.push(`/sahkopostivarmistus/virhe/${params.locale}/${params.loginToken}/UNKNOWN`);
        }
    };

    const virhekoodi = params.virhekoodi;
    if (virhekoodi === 'TOKEN_KAYTETTY') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_KAYTETTY_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (virhekoodi === 'TOKEN_VANHENTUNUT') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_VANHENTUNUT_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (virhekoodi === 'TOKEN_EI_LOYDY') {
        return (
            <VirhePage
                theme="virhe"
                topic="SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_OTSIKKO"
                text="SAHKOPOSTI_VARMENNUS_TOKEN_EI_LOYDY_TEKSTI"
                buttonText="SAHKOPOSTI_VARMENNUS_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (virhekoodi === 'UNKNOWN') {
        // Tähän ohjataan, jos redirectToFrontPage-metodi päätyy virheeseen
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
                <Button action={() => redirectToFrontPage()}>{L['SAHKOPOSTI_VARMENNUS_JATKA_PALVELUUN']}</Button>
            </div>
        );
    }
};

export default EmailVerificationErrorContainer;
