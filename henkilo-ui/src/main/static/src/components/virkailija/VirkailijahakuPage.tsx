import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import Select from 'react-select';
import { useSelector } from 'react-redux';

import { RootState, useAppDispatch } from '../../store';
import { setFilters as _setFilters, VirkailijahakuFilters } from '../../slices/virkailijahakuSlice';
import { useLocalisations } from '../../selectors';
import {
    PostHenkilohakuRequest,
    useGetKayttooikeusryhmasQuery,
    usePostVirkailijahakuQuery,
} from '../../api/kayttooikeus';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsChechbox } from '../design-system/OphDsCheckbox';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';
import { OphDsTable } from '../design-system/OphDsTable';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { virkailijaNavigation } from '../navigation/navigationconfigurations';
import { OphDsRyhmaSelect } from '../design-system/OphDsRyhmaSelect';
import { selectProps } from '../../utilities/select';
import { getLocalisedText } from '../common/StaticUtils';
import PropertySingleton from '../../globals/PropertySingleton';
import { Koodi, koodiLabel, useGetOrganisaatiotyypitQuery } from '../../api/koodisto';

import styles from './VirkailijahakuPage.module.css';

const mapFilters = (filters: VirkailijahakuFilters): PostHenkilohakuRequest => {
    return {
        nameQuery: filters.nameQuery,
        organisaatioOids: filters.ryhmaOid
            ? [filters.ryhmaOid]
            : filters.organisaatioOid
              ? [filters.organisaatioOid]
              : undefined,
        subOrganisation: filters.subOrganisation,
        kayttooikeusryhmaId: filters.kayttooikeusryhmaId,
    };
};

export const VirkailijahakuPage = () => {
    const { L, locale } = useLocalisations();
    useTitle(L('VIRKAILIJAHAKU'));
    useNavigation(virkailijaNavigation, false);
    const filters = useSelector<RootState, VirkailijahakuFilters>((state) => state.virkailijahaku);
    const setFilters = (filters: VirkailijahakuFilters) => useAppDispatch()(_setFilters(filters));
    const { data: kayttooikeusryhmas } = useGetKayttooikeusryhmasQuery({ passiiviset: false });
    const { data: organisaatiotyypit } = useGetOrganisaatiotyypitQuery();

    const [criteria, setCriteria] = useState<PostHenkilohakuRequest>(filters);
    const skip =
        (!criteria.nameQuery || criteria.nameQuery.length < 3) &&
        !criteria.organisaatioOids?.length &&
        !criteria.kayttooikeusryhmaId;
    const { data, isFetching } = usePostVirkailijahakuQuery(criteria, { skip });

    useEffect(() => {
        setCriteria(mapFilters(filters));
    }, [filters]);

    const organisaatiotyyppiMap: Record<string, Koodi> = useMemo(() => {
        return organisaatiotyypit?.reduce((acc, t) => ({ ...acc, [String(t.koodiUri)]: t }), {}) ?? {};
    }, [organisaatiotyypit]);

    const kayttooikeusryhmaOptions = useMemo(() => {
        return (kayttooikeusryhmas ?? [])
            .map((k) => ({ value: `${k.id}`, label: getLocalisedText(k.description, locale) ?? '' }))
            .sort((a, b) => (a.label && b.label ? a.label.localeCompare(b.label) : 1));
    }, [kayttooikeusryhmas]);

    const renderedData = useMemo(() => {
        return data && !skip && !isFetching ? data.map((a) => a).sort((a, b) => a.nimi.localeCompare(b.nimi)) : [];
    }, [data, skip, isFetching]);

    return (
        <OphDsPage header={L('VIRKAILIJAHAKU')}>
            {L('VIRKAILIJAHAKU_SELITE') && <p>{L('VIRKAILIJAHAKU_SELITE')}</p>}
            <div className={styles.formGrid}>
                <OphDsInput
                    id="nameQuery"
                    label={L('HAKUTERMI')}
                    onChange={(nameQuery) => setFilters({ ...filters, nameQuery })}
                    defaultValue={filters.nameQuery}
                    debounceTimeout={400}
                />
                <div />
                <OphDsOrganisaatioSelect
                    label={L('HENKILOHAKU_FILTERS_SUODATAORGANISAATIO')}
                    type="HENKILOHAKU"
                    disabled={!!filters.ryhmaOid}
                    defaultValue={filters.organisaatioOid}
                    onChange={(o) =>
                        setFilters({
                            ...filters,
                            organisaatioOid: o?.oid,
                            subOrganisation:
                                !o || o.oid === PropertySingleton.state.rootOrganisaatioOid
                                    ? false
                                    : filters.subOrganisation,
                        })
                    }
                />
                <OphDsRyhmaSelect
                    defaultValue={filters.ryhmaOid}
                    label={L('HENKILOHAKU_FILTERS_RYHMA_PLACEHOLDER')}
                    type="HENKILOHAKU"
                    disabled={!!filters.organisaatioOid}
                    selectOrganisaatio={(r) =>
                        setFilters({ ...filters, organisaatioOid: undefined, ryhmaOid: r?.value })
                    }
                    selectedOrganisaatioOid={filters.ryhmaOid}
                />
                <div>
                    <OphDsChechbox
                        id="subOrganisations"
                        checked={!!filters.subOrganisation}
                        label={L('HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA')}
                        disabled={
                            !filters.organisaatioOid ||
                            filters.organisaatioOid === PropertySingleton.state.rootOrganisaatioOid
                        }
                        onChange={() => setFilters({ ...filters, subOrganisation: !filters.subOrganisation })}
                    />
                </div>
                <div />
                <div>
                    <label htmlFor="kayttooikeusryhma-select" className="oph-ds-label">
                        {L('HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER')}
                    </label>
                    <Select
                        {...selectProps}
                        inputId="kayttooikeusryhma-select"
                        defaultValue={kayttooikeusryhmaOptions.find(
                            (o) => o.value === `${filters.kayttooikeusryhmaId}`
                        )}
                        options={kayttooikeusryhmaOptions}
                        placeholder={L('VALITSE_KAYTTOOIKEUSRYHMA')}
                        onChange={(id) =>
                            setFilters({ ...filters, kayttooikeusryhmaId: id ? parseInt(id.value) : undefined })
                        }
                        isClearable
                    />
                </div>
            </div>
            <OphDsTable
                headers={[L('HENKILO_NIMI'), L('USERNAME'), L('HENKILOHAKU_ORGANISAATIO')]}
                isFetching={isFetching}
                rows={renderedData.map((d) => [
                    <Link key={`link-${d.kayttajatunnus}`} to={`/virkailija2/${d.oidHenkilo}`} className="oph-ds-link">
                        {d.nimi || d.oidHenkilo}
                    </Link>,
                    <span key={`nimi-${d.kayttajatunnus}`}>{d.kayttajatunnus}</span>,
                    <ul key={`orgs-${d.kayttajatunnus}`} className="oph-ds-ul">
                        {d.organisaatioNimiList.map((o) => (
                            <li key={o.identifier}>
                                {`${o.localisedLabels[locale] ?? o.identifier} (${o.tyypit
                                    .map((t) => koodiLabel(organisaatiotyyppiMap[t], locale))
                                    .join(',')
                                    .toUpperCase()})`}
                            </li>
                        ))}
                    </ul>,
                ])}
                rowDescriptionPartitive={L('VIRKAILIJAA')}
            />
        </OphDsPage>
    );
};
