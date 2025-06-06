import React from 'react';
import { Link } from 'react-router';

import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import LocalizedTextGroup from '../../common/LocalizedTextGroup';
import { Localisations } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { useGetKayttooikeusryhmaRoolisQuery } from '../../../api/kayttooikeus';

import './KayttooikeusryhmaTiedot.css';

type Props = {
    muokkausoikeus: boolean;
    locale: Locale;
    L: Localisations;
    item: Kayttooikeusryhma;
    show: boolean;
};

const KayttooikeusryhmaTiedot = ({ item, L, locale, muokkausoikeus, show }: Props) => {
    const { data: palveluRoolit } = useGetKayttooikeusryhmaRoolisQuery(item?.id && String(item.id), {
        skip: !item?.id || !show,
    });
    const kuvaus = item?.kuvaus?.texts;

    return show ? (
        <div className="kayttooikeusryhma-tiedot">
            <LocalizedTextGroup texts={kuvaus} locale={locale}></LocalizedTextGroup>
            <div className="kayttooikeusryhma-tiedot-roolit">
                <div className="kayttooikeusryhma-tiedot-otsikko">{L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELU']}</div>
                <div className="kayttooikeusryhma-tiedot-otsikko">{L['KAYTTOOIKEUSRYHMAT_LISAA_KAYTTOOIKEUS']}</div>
                {(palveluRoolit ?? []).map((item, index) => (
                    <React.Fragment key={index + item.palveluTexts[0].text}>
                        <div>
                            <LocalizedTextGroup locale={locale} texts={item.palveluTexts}></LocalizedTextGroup>
                        </div>
                        <div>
                            <LocalizedTextGroup locale={locale} texts={item.rooliTexts}></LocalizedTextGroup>
                        </div>
                    </React.Fragment>
                ))}
            </div>
            <Link to={`/kayttooikeusryhmat/${item.id}`} className="oph-ds-link" disabled={!muokkausoikeus}>
                {L['MUOKKAA']}
            </Link>
        </div>
    ) : null;
};

export default KayttooikeusryhmaTiedot;
