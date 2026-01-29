import React from 'react';
import { useParams } from 'react-router';

import VahvaTunnistusInfoPage from './VahvaTunnistusInfoPage';
import VirhePage from '../VirhePage';
import { toSupportedLocale } from '../../selectors';

const VahvaTunnistusInfoContainer = () => {
    const params = useParams();
    const { loginToken, locale: anyLocale } = params;
    const locale = toSupportedLocale(anyLocale);
    const virhe = window.location.pathname.indexOf('/vahvatunnistusinfo/virhe/') !== -1;
    if (loginToken === 'vanha') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_TOKEN_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_TOKEN_TEKSTI"
                buttonText="VAHVATUNNISTUSINFO_VIRHE_TOKEN_LINKKI"
            />
        );
    } else if (loginToken === 'vaara') {
        return (
            <VirhePage
                topic="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (loginToken === 'palvelukayttaja') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (loginToken === 'eiloydy') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (loginToken === 'passivoitu') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (loginToken === 'eivirkailija') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (loginToken === 'vanhakutsu') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_TEKSTI"
                buttonText=""
            />
        );
    } else if (virhe) {
        return <VirhePage topic="VAHVATUNNISTUSINFO_VIRHE_OTSIKKO" text="VAHVATUNNISTUSINFO_VIRHE_TEKSTI" />;
    } else {
        return <VahvaTunnistusInfoPage loginToken={loginToken!} locale={locale} />;
    }
};

export default VahvaTunnistusInfoContainer;
