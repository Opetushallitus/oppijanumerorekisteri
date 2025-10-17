import React from 'react';
import { Link } from 'react-router';

import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { Localisations } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { useGetKayttooikeusryhmaRoolisQuery } from '../../../api/kayttooikeus';
import { localizeTextGroup } from '../../../utilities/localisation.util';

import './KayttooikeusryhmaTiedot.css';

type Props = {
    muokkausoikeus: boolean;
    locale: Locale;
    L: Localisations;
    item: Kayttooikeusryhma;
    show: boolean;
};

const KayttooikeusryhmaTiedot = ({ item, L, locale, muokkausoikeus, show }: Props) => {
    const { data: palveluRoolit } = useGetKayttooikeusryhmaRoolisQuery(String(item.id), {
        skip: !item?.id || !show,
    });
    const kuvaus = item?.kuvaus?.texts;

    return show ? (
        <div className="kayttooikeusryhma-tiedot">
            <span>{localizeTextGroup(kuvaus, locale)}</span>
            <div className="kayttooikeusryhma-tiedot-roolit">
                <div className="kayttooikeusryhma-tiedot-otsikko">{L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELU']}</div>
                <div className="kayttooikeusryhma-tiedot-otsikko">{L['KAYTTOOIKEUSRYHMAT_LISAA_KAYTTOOIKEUS']}</div>
                {(palveluRoolit ?? []).map((item, index) => (
                    <React.Fragment key={index + (item.palveluTexts[0]?.text ?? '')}>
                        <div className="kayttooikeusryhma-tiedot-palvelu">
                            <span>{localizeTextGroup(item.palveluTexts, locale)}</span>
                        </div>
                        <div className="kayttooikeusryhma-tiedot-rooli">
                            <span>{localizeTextGroup(item.rooliTexts, locale)}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
            {muokkausoikeus && (
                <Link to={`/kayttooikeusryhmat/${item.id}`} className="oph-ds-link">
                    {L['MUOKKAA']}
                </Link>
            )}
        </div>
    ) : null;
};

export default KayttooikeusryhmaTiedot;
