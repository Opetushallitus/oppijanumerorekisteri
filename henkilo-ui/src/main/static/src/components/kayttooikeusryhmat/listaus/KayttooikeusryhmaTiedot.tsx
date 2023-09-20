import React, { useEffect, useState } from 'react';
import { Locale } from '../../../types/locale.type';
import { http } from '../../../http';
import { urls } from 'oph-urls-js';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { PalveluRooli } from '../../../types/domain/kayttooikeus/PalveluRooli.types';
import LocalizedTextGroup from '../../common/LocalizedTextGroup';
import './KayttooikeusryhmaTiedot.css';
import { Localisations } from '../../../types/localisation.type';
import { Link } from 'react-router';

type Props = {
    muokkausoikeus: boolean;
    item: Kayttooikeusryhma;
    locale: Locale;
    L: Localisations;
    show: boolean;
};

const KayttooikeusryhmaTiedot = (props: Props) => {
    const [palveluRoolit, setPalveluRoolit] = useState<PalveluRooli[]>([]);

    useEffect(() => {
        const fetchPalveluRoolit = async () => {
            const url = urls.url('kayttooikeus-service.kayttooikeusryhma.palvelurooli', props.item.id);
            const data = await http.get<PalveluRooli[]>(url);
            setPalveluRoolit(data);
        };

        if (props.show && palveluRoolit.length === 0) {
            fetchPalveluRoolit();
        }
    }, [props]);

    const kuvaus = props.item?.kuvaus?.texts;

    return props.show ? (
        <div className="kayttooikeusryhma-tiedot">
            <LocalizedTextGroup texts={kuvaus} locale={props.locale}></LocalizedTextGroup>
            <div className="flex-horizontal kayttooikeusryhma-tiedot-palvelutroolit-header">
                <div className="flex-item-1 ">{props.L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELU']}</div>
                <div className="flex-item-1">{props.L['KAYTTOOIKEUSRYHMAT_LISAA_KAYTTOOIKEUS']}</div>
                <div className="flex-item-2"></div>
            </div>
            <div className="kayttooikeusryhma-tiedot-palvelutroolit">
                {palveluRoolit.map((item: PalveluRooli, index: number) => (
                    <div key={index} className="flex-horizontal">
                        <div className="flex-item-1">
                            <LocalizedTextGroup locale={props.locale} texts={item.palveluTexts}></LocalizedTextGroup>
                        </div>
                        <div className="flex-item-1">
                            <LocalizedTextGroup locale={props.locale} texts={item.rooliTexts}></LocalizedTextGroup>
                        </div>
                        <div className="flex-item-2"></div>
                    </div>
                ))}
            </div>
            <Link
                to={`/kayttooikeusryhmat/${props.item.id}`}
                className="oph-button oph-button-primary"
                disabled={!props.muokkausoikeus}
            >
                {props.L['MUOKKAA']}
            </Link>
        </div>
    ) : null;
};

export default KayttooikeusryhmaTiedot;
