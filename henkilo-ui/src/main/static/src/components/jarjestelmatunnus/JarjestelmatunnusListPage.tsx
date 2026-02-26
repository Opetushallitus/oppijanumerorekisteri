import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import Select, { SingleValue } from 'react-select';

import { useLocalisations } from '../../selectors';
import {
    PostHenkilohakuRequest,
    useGetKayttooikeusryhmasQuery,
    usePostJarjestelmatunnushakuQuery,
} from '../../api/kayttooikeus';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsChechbox } from '../design-system/OphDsCheckbox';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsOrganisaatioSelect } from '../design-system/OphDsOrganisaatioSelect';
import { OphDsTable } from '../design-system/OphDsTable';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { jarjestelmatunnusNavigation } from '../navigation/navigationconfigurations';
import { Koodi, koodiLabel, useGetOrganisaatiotyypitQuery } from '../../api/koodisto';
import PropertySingleton from '../../globals/PropertySingleton';
import { selectProps } from '../../utilities/select';
import { getLocalisedText } from '../common/StaticUtils';

import styles from './JarjestelmatunnusListPage.module.css';

const defaultCriteria: PostHenkilohakuRequest = {
    nameQuery: undefined,
    organisaatioOids: undefined,
    subOrganisation: false,
    kayttooikeusryhmaId: undefined,
};

export const JarjestelmatunnusListPage = () => {
    const { L, locale } = useLocalisations();
    useTitle(L('JARJESTELMATUNNUSTEN_HAKU'));
    useNavigation(jarjestelmatunnusNavigation(), false);
    const [criteria, setCriteria] = useState<PostHenkilohakuRequest>(defaultCriteria);
    const skip =
        (!criteria.nameQuery || criteria.nameQuery.length < 3) &&
        !criteria.organisaatioOids?.length &&
        !criteria.kayttooikeusryhmaId;
    const { data, isFetching } = usePostJarjestelmatunnushakuQuery(criteria, { skip });
    const { data: kayttooikeusryhmas } = useGetKayttooikeusryhmasQuery({ passiiviset: false });
    const { data: organisaatiotyypit } = useGetOrganisaatiotyypitQuery();

    const setOrganisationCriteria = (selection: SingleValue<OrganisaatioSelectObject>) =>
        setCriteria({ ...criteria, organisaatioOids: selection ? [selection.oid] : undefined });

    const kayttooikeusryhmaOptions = useMemo(() => {
        return (kayttooikeusryhmas ?? [])
            .map((k) => ({ value: `${k.id}`, label: getLocalisedText(k.description, locale) ?? '' }))
            .sort((a, b) => (a.label && b.label ? a.label.localeCompare(b.label) : 1));
    }, [kayttooikeusryhmas]);

    const organisaatiotyyppiMap: Record<string, Koodi> = useMemo(() => {
        return organisaatiotyypit?.reduce((acc, t) => ({ ...acc, [String(t.koodiUri)]: t }), {}) ?? {};
    }, [organisaatiotyypit]);

    return (
        <OphDsPage header={L('JARJESTELMATUNNUSTEN_HAKU')}>
            <div className={styles.jarjestelmatunnusHakuForm}>
                <OphDsInput
                    id="nameQuery"
                    label={L('SUODATA_PALVELUN_NIMELLA')}
                    onChange={(nameQuery) => setCriteria({ ...criteria, nameQuery })}
                    defaultValue={criteria.nameQuery}
                    debounceTimeout={400}
                />
                <div>
                    <label htmlFor="kayttooikeusryhma-select" className="oph-ds-label">
                        {L('HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER')}
                    </label>
                    <Select
                        {...selectProps}
                        inputId="kayttooikeusryhma-select"
                        defaultValue={kayttooikeusryhmaOptions.find(
                            (o) => o.value === `${criteria.kayttooikeusryhmaId}`
                        )}
                        options={kayttooikeusryhmaOptions}
                        placeholder={L('VALITSE_KAYTTOOIKEUSRYHMA')}
                        onChange={(id) =>
                            setCriteria({ ...criteria, kayttooikeusryhmaId: id ? parseInt(id.value) : undefined })
                        }
                        isClearable
                    />
                </div>
                <OphDsOrganisaatioSelect
                    label={L('HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO')}
                    onChange={setOrganisationCriteria}
                />
                <div />
                <div>
                    <OphDsChechbox
                        checked={!!criteria.subOrganisation}
                        id="subOrganisations"
                        label={L('HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA')}
                        disabled={
                            !criteria.organisaatioOids ||
                            criteria.organisaatioOids[0] === PropertySingleton.state.rootOrganisaatioOid
                        }
                        onChange={() => setCriteria({ ...criteria, subOrganisation: !criteria.subOrganisation })}
                    />
                </div>
            </div>
            <OphDsTable
                headers={[L('HENKILO_PALVELUN_NIMI'), L('USERNAME'), L('HENKILOHAKU_ORGANISAATIO')]}
                isFetching={isFetching}
                rows={(data ?? []).map((d) => [
                    <Link
                        key={`link-${d.kayttajatunnus}`}
                        to={`/jarjestelmatunnus/${d.oidHenkilo}`}
                        className="oph-ds-link"
                    >
                        {d.nimi.split(',')[0]}
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
                rowDescriptionPartitive={L('JARJESTELMATUNNUSTA')}
            />
        </OphDsPage>
    );
};
