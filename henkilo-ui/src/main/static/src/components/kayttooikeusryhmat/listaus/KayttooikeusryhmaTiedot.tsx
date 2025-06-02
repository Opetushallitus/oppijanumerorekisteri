import React, { useEffect, useState } from 'react';
import { urls } from 'oph-urls-js';
import { Link } from 'react-router';

import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { PalveluRooli } from '../../../types/domain/kayttooikeus/PalveluRooli.types';
import LocalizedTextGroup from '../../common/LocalizedTextGroup';
import { Localisations } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { http } from '../../../http';

import './KayttooikeusryhmaTiedot.css';

type Props = {
    muokkausoikeus: boolean;
    locale: Locale;
    L: Localisations;
    item: Kayttooikeusryhma;
    show: boolean;
};

const KayttooikeusryhmaTiedot = ({ item, L, locale, muokkausoikeus, show }: Props) => {
    const [palveluRoolit, setPalveluRoolit] = useState<PalveluRooli[]>([]);

    useEffect(() => {
        const fetchPalveluRoolit = async () => {
            const url = urls.url('kayttooikeus-service.kayttooikeusryhma.palvelurooli', item.id);
            const data = await http.get<PalveluRooli[]>(url);
            setPalveluRoolit(data);
        };

        if (show && palveluRoolit.length === 0) {
            fetchPalveluRoolit();
        }
    }, [show]);

    const kuvaus = item?.kuvaus?.texts;

    return show ? (
        <div className="kayttooikeusryhma-tiedot">
            <LocalizedTextGroup texts={kuvaus} locale={locale}></LocalizedTextGroup>
            <div className="flex-horizontal kayttooikeusryhma-tiedot-palvelutroolit-header">
                <div className="flex-item-1 ">{L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELU']}</div>
                <div className="flex-item-1">{L['KAYTTOOIKEUSRYHMAT_LISAA_KAYTTOOIKEUS']}</div>
                <div className="flex-item-2"></div>
            </div>
            <div className="kayttooikeusryhma-tiedot-palvelutroolit">
                {palveluRoolit.map((item: PalveluRooli, index: number) => (
                    <div key={index} className="flex-horizontal">
                        <div className="flex-item-1">
                            <LocalizedTextGroup locale={locale} texts={item.palveluTexts}></LocalizedTextGroup>
                        </div>
                        <div className="flex-item-1">
                            <LocalizedTextGroup locale={locale} texts={item.rooliTexts}></LocalizedTextGroup>
                        </div>
                        <div className="flex-item-2"></div>
                    </div>
                ))}
            </div>
            <Link to={`/kayttooikeusryhmat/${item.id}`} className="oph-ds-link" disabled={!muokkausoikeus}>
                {L['MUOKKAA']}
            </Link>
        </div>
    ) : null;
};

export default KayttooikeusryhmaTiedot;
