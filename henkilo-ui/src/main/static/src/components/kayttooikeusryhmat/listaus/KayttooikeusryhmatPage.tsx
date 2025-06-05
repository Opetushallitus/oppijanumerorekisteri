import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { useLocalisations } from '../../../selectors';
import { useGetKayttooikeusryhmasQuery, useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { OphDsPage } from '../../design-system/OphDsPage';
import { OphDsInput } from '../../design-system/OphDsInput';
import { OphDsChechbox } from '../../design-system/OphDsCheckbox';
import { OphDsRadioGroup } from '../../design-system/OphDsRadioGroup';
import { OphDsAccordion } from '../../design-system/OphDsAccordion';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';

import './KayttooikeusryhmatPage.css';

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
    const [showType, setShowType] = useState<'virkailija' | 'palvelu'>('virkailija');
    const [filter, setFilter] = useState('');
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: showPassives });

    const accordionItems = useMemo(() => {
        if (!kayttooikeusryhmat) {
            return [];
        }
        const visibleKayttooikeusryhmas = kayttooikeusryhmat
            .filter((k) =>
                showType === 'palvelu'
                    ? k.sallittuKayttajatyyppi === 'PALVELU'
                    : k.sallittuKayttajatyyppi === null || k.sallittuKayttajatyyppi === 'VIRKAILIJA'
            )
            .filter(nimiFilter(filter, locale))
            .sort(nimiSort(locale));

        return visibleKayttooikeusryhmas.map((item) => {
            const statusString = item.passivoitu ? ` (${L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})` : '';
            return {
                header: `${localizeTextGroup(item?.nimi?.texts, locale)} ${statusString}`,
                children: (show: boolean) => (
                    <KayttooikeusryhmaTiedot
                        muokkausoikeus={muokkausoikeus}
                        show={show}
                        item={item}
                        L={L}
                        locale={locale}
                    />
                ),
            };
        });
    }, [kayttooikeusryhmat, showType, filter]);

    return (
        <OphDsPage header={L['KAYTTOOIKEUSRYHMAT_OTSIKKO_LISTA']}>
            <section className="kayttoikeusryhmat-form">
                <div>
                    <OphDsInput id="filter" label={L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} onChange={setFilter} />
                    <div className="kayttoikeusryhmat-form-cell">
                        <OphDsRadioGroup
                            checked={showType}
                            groupName="show-palvelu"
                            legend="Suodata käyttäjätyypillä"
                            onChange={setShowType}
                            radios={[
                                { id: 'virkailija', label: L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_VIRKAILIJA'] },
                                { id: 'palvelu', label: L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PALVELU'] },
                            ]}
                        />
                    </div>
                    {muokkausoikeus && (
                        <div className="kayttoikeusryhmat-form-cell">
                            <div>
                                <Link className="oph-ds-link" to="/kayttooikeusryhmat/lisaa">
                                    {L['KAYTTOOIKEUSRYHMAT_LISAA']}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <div className="kayttoikeusryhmat-form-cell">
                        <div>
                            <OphDsChechbox
                                id="kayttooikeusryhmaNaytaPassivoidut"
                                label={L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PASSIVOIDUT']}
                                onChange={() => setShowPassives(!showPassives)}
                            />
                        </div>
                    </div>
                </div>
            </section>
            <OphDsAccordion items={accordionItems} />
        </OphDsPage>
    );
};
