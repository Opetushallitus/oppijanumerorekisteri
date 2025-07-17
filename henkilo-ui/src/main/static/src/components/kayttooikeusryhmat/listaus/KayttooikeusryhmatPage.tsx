import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import Select, { SelectInstance } from 'react-select';

import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { useLocalisations } from '../../../selectors';
import {
    useGetKayttooikeusryhmasQuery,
    useGetOmattiedotQuery,
    useGetPalveluKayttooikeudetQuery,
    useGetPalvelutQuery,
} from '../../../api/kayttooikeus';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { OphDsPage } from '../../design-system/OphDsPage';
import { OphDsInput } from '../../design-system/OphDsInput';
import { OphDsChechbox } from '../../design-system/OphDsCheckbox';
import { OphDsRadioGroup } from '../../design-system/OphDsRadioGroup';
import { OphDsAccordion } from '../../design-system/OphDsAccordion';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';
import { SelectOption, selectStyles } from '../../../utilities/select';

import './KayttooikeusryhmatPage.css';
import { useTitle } from '../../../useTitle';

type Kayttajatyyppi = 'virkailija' | 'palvelu';

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
    useTitle(L['TITLE_KAYTTO_OIKEUSRYHMA']);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const muokkausoikeus =
        !!omattiedot?.organisaatiot &&
        hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'KOOSTEROOLIENHALLINTA_CRUD',
            'HENKILONHALLINTA_OPHREKISTERI',
            'KAYTTOOIKEUS_REKISTERINPITAJA',
        ]);
    const [passiiviset, setPassiiviset] = useState(false);
    const [showType, setShowType] = useState<Kayttajatyyppi>('virkailija');
    const [filter, setFilter] = useState('');
    const [palvelu, setPalvelu] = useState<SelectOption>();
    const [kayttooikeus, setKayttooikeus] = useState<SelectOption>();
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({
        passiiviset,
        palvelu: palvelu?.value,
        kayttooikeus: kayttooikeus?.value,
    });
    const { data: palvelut } = useGetPalvelutQuery();
    const { data: kayttooikeudet } = useGetPalveluKayttooikeudetQuery(palvelu?.value, {
        skip: !palvelu,
    });
    const kayttooikeusSelectRef = useRef<SelectInstance<SelectOption>>(null);

    const setPalveluAndKayttooikeus = (p: SelectOption) => {
        if (!p) {
            kayttooikeusSelectRef.current.clearValue();
            setKayttooikeus(undefined);
        }
        setPalvelu(p);
    };

    const palveluOptions = useMemo(
        () =>
            (palvelut ?? []).map((p) => ({
                value: p.name,
                label: p.description.texts?.find((t) => t.lang === locale.toUpperCase())?.text,
            })),
        [palvelut]
    );
    const kayttooikeusOptions = useMemo(
        () =>
            (kayttooikeudet ?? []).map((k) => ({
                value: k.rooli,
                label: k.oikeusLangs.find((o) => o.lang === locale.toUpperCase())?.text,
            })),
        [kayttooikeudet]
    );

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
                <div className="kayttoikeusryhmat-row">
                    <OphDsInput id="filter" label={L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} onChange={setFilter} />
                    <div className="kayttoikeusryhmat-form-cell">
                        <OphDsRadioGroup
                            checked={showType}
                            groupName="show-palvelu"
                            legend={L['KAYTTOOIKEUSRYHMAT_SUODATA_TYYPILLA']}
                            onChange={setShowType}
                            radios={[
                                { id: 'virkailija', label: L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_VIRKAILIJA'] },
                                { id: 'palvelu', label: L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PALVELU'] },
                            ]}
                        />
                    </div>
                    <div className="kayttoikeusryhmat-form-cell">
                        <div>
                            <OphDsChechbox
                                id="kayttooikeusryhmaNaytaPassivoidut"
                                label={L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PASSIVOIDUT']}
                                checked={passiiviset}
                                onChange={() => setPassiiviset(!passiiviset)}
                            />
                        </div>
                    </div>
                </div>
                <div className="kayttooikeusryhmat-row-kayttooikeus">
                    <div>{L['KAYTTOOIKEUSRYHMAT_SUODATA_KAYTTOOIKEUDELLA']}</div>
                    <div>
                        <Select
                            {...selectStyles}
                            options={palveluOptions}
                            value={palvelu}
                            placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_PALVELU']}
                            onChange={setPalveluAndKayttooikeus}
                            isClearable
                        />
                        <Select
                            {...selectStyles}
                            ref={kayttooikeusSelectRef}
                            options={kayttooikeusOptions}
                            isDisabled={!palvelu}
                            value={kayttooikeus}
                            placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUS']}
                            onChange={setKayttooikeus}
                            isClearable
                        />
                    </div>
                </div>
                <div>
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
            </section>
            <OphDsAccordion items={accordionItems} />
        </OphDsPage>
    );
};
