import React, { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';

import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import {
    GetHaetutKayttooikeusryhmatRequest,
    useGetKayttooikeusryhmasQuery,
    useGetOmattiedotQuery,
    useGetOrganisaatioRyhmatQuery,
} from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useDebounce } from '../../useDebounce';
import { SelectOption, selectProps } from '../../utilities/select';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsRadioGroup } from '../design-system/OphDsRadioGroup';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';

type OwnProps = {
    onSubmit: (criteria: Partial<GetHaetutKayttooikeusryhmatRequest>) => void;
};

const HaetutKayttooikeusRyhmatHakuForm = ({ onSubmit }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [naytaKaikki, setNaytaKaikki] = useState(false);
    const [selectedOrganisaatio, setSelectedOrganisaatio] = useState<OrganisaatioSelectObject>();
    const [selectedRyhma, setSelectedRyhma] = useState<string>();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttooikeusryhmat } = useGetKayttooikeusryhmasQuery({ passiiviset: false });
    const { data: ryhmat } = useGetOrganisaatioRyhmatQuery();
    const [kayttooikeusryhmaFilter, setKayttooikeusryhmaFilter] = useState('');
    const debouncedKayttooikeusryhmaFilter = useDebounce(kayttooikeusryhmaFilter, 500);

    useEffect(() => {
        onSubmit({ q: debouncedSearchTerm });
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const kayttooikeusRyhmaIds =
            debouncedKayttooikeusryhmaFilter.length < 4
                ? undefined
                : (kayttooikeusryhmat ?? [])
                      .filter((k) =>
                          k.nimi.texts
                              ?.filter((text) => text.lang === locale.toUpperCase())[0]
                              ?.text.toLowerCase()
                              .includes(debouncedKayttooikeusryhmaFilter.toLowerCase())
                      )
                      .map((k) => k.id);
        onSubmit({ kayttooikeusRyhmaIds });
    }, [debouncedKayttooikeusryhmaFilter]);

    const onOrganisaatioChange = (organisaatio: SingleValue<OrganisaatioSelectObject>) => {
        setSelectedOrganisaatio(organisaatio ?? undefined);
        setSelectedRyhma(undefined);
        onSubmit({ organisaatioOids: organisaatio?.oid });
    };

    const onRyhmaChange = (ryhma: SingleValue<SelectOption>) => {
        const ryhmaOid = ryhma ? ryhma.value : undefined;
        setSelectedOrganisaatio(undefined);
        setSelectedRyhma(ryhmaOid);
        onSubmit({ organisaatioOids: ryhmaOid });
    };

    const onNaytaKaikkiChange = (naytaKaikki: boolean) => {
        setSelectedOrganisaatio(undefined);
        setNaytaKaikki(naytaKaikki);
        onSubmit({ adminView: String(!naytaKaikki) });
    };

    const ryhmaOptions = useMemo(() => {
        return (ryhmat ?? [])
            .map((ryhma) => ({
                label: ryhma.nimi[locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [ryhmat, locale]);

    return (
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <OphDsInput
                    id="searchTerm"
                    label={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']!}
                    defaultValue={searchTerm}
                    onChange={setSearchTerm}
                />
                <OphDsInput
                    id="kayttooikeusryhmaFilter"
                    label={L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']!}
                    defaultValue={kayttooikeusryhmaFilter}
                    onChange={setKayttooikeusryhmaFilter}
                />
                {omattiedot?.isAdmin && (
                    <OphDsRadioGroup<'true' | 'false'>
                        checked={`${naytaKaikki}`}
                        groupName="nayta-kaikki"
                        legend=""
                        onChange={(n) => onNaytaKaikkiChange(n === 'true')}
                        radios={[
                            { id: 'true', value: 'true', label: L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']! },
                            { id: 'false', value: 'false', label: L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']! },
                        ]}
                    />
                )}
            </div>
            <OphDsOrganisaatioSelect disabled={!!selectedRyhma} onChange={onOrganisaatioChange} />
            {(omattiedot?.isAdmin || omattiedot?.isMiniAdmin) && (
                <Select
                    {...selectProps}
                    id="ryhmafilter"
                    options={ryhmaOptions}
                    isDisabled={!!selectedOrganisaatio}
                    value={ryhmaOptions.find((o) => o.value === selectedRyhma)}
                    placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                    onChange={onRyhmaChange}
                    isClearable
                />
            )}
        </form>
    );
};

export default HaetutKayttooikeusRyhmatHakuForm;
