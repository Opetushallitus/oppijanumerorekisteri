import React from 'react';

import { useLocalisations } from '../../selectors';
import Button from '../../components/common/button/Button';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

type Props = {
    loginToken: string;
    locale: string;
};

const getHost = () => {
    const splitted = window.location.host.split('.');
    if (splitted.length > 1) {
        return splitted.slice(-2).join('.');
    } else {
        return splitted[0];
    }
};

const VahvaTunnistusInfoPage = ({ loginToken, locale: anyLocale }: Props) => {
    const { l10n } = useLocalisations();
    const locale = toSupportedLocale(anyLocale);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN']);

    const casOppijaDomain = `https://${getHost()}`;
    const service = `${casOppijaDomain}/kayttooikeus-service/cas/tunnistus?${new URLSearchParams({
        loginToken,
        locale,
    })}`;
    const identificationUrl = `${casOppijaDomain}/cas-oppija/login?${new URLSearchParams({ service, locale })}`;
    return (
        <div className="infoPageWrapper">
            <h2 className="oph-h2 oph-bold">{L['VAHVATUNNISTUSINFO_OTSIKKO']}</h2>
            <span className="oph-bold">{L['VAHVATUNNISTUSINFO_TEKSTI']}</span>
            <div style={{ textAlign: 'center', paddingTop: '25px' }}>
                <Button href={identificationUrl} isButton big>
                    {L['VAHVATUNNISTUSINFO_LINKKI']}
                </Button>
            </div>
        </div>
    );
};

export default VahvaTunnistusInfoPage;
