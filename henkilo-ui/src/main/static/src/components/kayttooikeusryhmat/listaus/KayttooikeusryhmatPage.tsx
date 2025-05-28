import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { useLocalisations } from '../../../selectors';
import { useGetKayttooikeusryhmasQuery, useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { KayttooikeusryhmaLista } from './KayttooikeusryhmaLista';
import BooleanRadioButtonGroup from '../../common/radiobuttongroup/BooleanRadioButtonGroup';

import './KayttooikeusryhmatPage.css';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../utilities/localisation.util';

const nimiFilter = (filter: string, locale: string) => (item: Kayttooikeusryhma) => {
    if (filter.length === 0) {
        return true;
    }
    const nimi = item?.nimi?.texts?.find((text) => text.lang === locale.toUpperCase());
    const text = nimi ? nimi?.text : '';
    return text.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
};

const nimiSort = (locale: string) => (a: Kayttooikeusryhma, b: Kayttooikeusryhma) => {
    const nameA = (localizeTextGroup(a?.nimi?.texts ?? [], locale) ?? '').toLowerCase();
    const nameB = (localizeTextGroup(b?.nimi?.texts ?? [], locale) ?? '').toLowerCase();
    if (nameA < nameB) {
        return -1;
    }
    if (nameB < nameA) {
        return 1;
    }
    return 0;
};

export const KayttooikeusryhmatPage = () => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const muokkausoikeus = hasAnyPalveluRooli(omattiedot.organisaatiot, [
        'KOOSTEROOLIENHALLINTA_CRUD',
        'HENKILONHALLINTA_OPHREKISTERI',
        'KAYTTOOIKEUS_REKISTERINPITAJA',
    ]);
    const [showPassives, setShowPassives] = useState(false);
    const [showPalvelu, setShowPalvelu] = useState(false);
    const [filter, setFilter] = useState('');
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: showPassives });

    const visibleKayttooikeusryhmas = useMemo(() => {
        if (!kayttooikeusryhmat) {
            return [];
        }
        return kayttooikeusryhmat
            .filter((k) =>
                showPalvelu
                    ? k.sallittuKayttajatyyppi === 'PALVELU'
                    : k.sallittuKayttajatyyppi === null || k.sallittuKayttajatyyppi === 'VIRKAILIJA'
            )
            .filter(nimiFilter(filter, locale))
            .sort(nimiSort(locale));
    }, [kayttooikeusryhmat, showPalvelu, filter]);

    return (
        <div className="wrapper kayttooikeusryhmat-hallinta">
            <h2 className="oph-h2 oph-bold">{L['KAYTTOOIKEUSRYHMAT_OTSIKKO_LISTA']}</h2>
            <div className="kayttoikeusryhma-lista-suodatin">
                <div className="oph-field">
                    <div className="oph-input-container flex-horizontal">
                        <input
                            type="text"
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder={L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']}
                            className="oph-input flex-item-1"
                        />
                        <BooleanRadioButtonGroup
                            value={showPalvelu}
                            onChange={() => setShowPalvelu(!showPalvelu)}
                            trueLabel={L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PALVELU']}
                            falseLabel={L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_VIRKAILIJA']}
                        />
                        <Link
                            className="oph-button oph-button-primary lisaa-kayttooikeusryhma-button"
                            to={'/kayttooikeusryhmat/lisaa'}
                            disabled={!muokkausoikeus}
                        >
                            {L['KAYTTOOIKEUSRYHMAT_LISAA']}
                        </Link>
                    </div>
                    <div className="oph-input-container flex-horizontal">
                        <div className="flex-inline">
                            <label className="oph-checkable" htmlFor="kayttooikeusryhmaNaytaPassivoidut">
                                <input
                                    id="kayttooikeusryhmaNaytaPassivoidut"
                                    type="checkbox"
                                    className="oph-checkable-input"
                                    onChange={() => setShowPassives(!showPassives)}
                                    checked={showPassives}
                                />
                                <span className="oph-checkable-text">
                                    {L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PASSIVOIDUT']}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <KayttooikeusryhmaLista muokkausoikeus={muokkausoikeus} items={visibleKayttooikeusryhmas} />
        </div>
    );
};
