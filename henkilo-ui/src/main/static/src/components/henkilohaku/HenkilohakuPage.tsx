import './HenkilohakuPage.css';
import React, { useEffect, useState } from 'react';
import HenkilohakuFilters from './HenkilohakuFilters';
import Table from '../common/table/Table';
import DelayedSearchInput from './DelayedSearchInput';
import StaticUtils from '../common/StaticUtils';
import Loader from '../common/icons/Loader';
import { Link } from 'react-router';
import { toLocalizedText } from '../../localizabletext';
import {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters,
} from '../../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HenkilohakuResult } from '../../types/domain/kayttooikeus/HenkilohakuResult.types';
import { useLocalisations } from '../../selectors';
import { Option } from 'react-select';

type Props = {
    henkilohakuAction: (arg0: HenkilohakuCriteria, arg1: HenkilohakuQueryparameters) => void;
    henkilohakuCount: (arg0: HenkilohakuCriteria) => void;
    updateFilters: (arg0: HenkilohakuCriteria) => void;
    henkilohakuResult: Array<HenkilohakuResult>;
    henkilohakuResultCount: number;
    henkiloHakuFilters: HenkilohakuCriteria;
    henkilohakuLoading: boolean;
    clearHenkilohaku: () => void;
};

const columnHeaders = [
    {
        key: 'HENKILO_NIMI',
        maxWidth: 400,
    },
    {
        key: 'USERNAME',
        maxWidth: 200,
    },
    {
        key: 'HENKILOHAKU_ORGANISAATIO',
        notSortable: true,
    },
];

const HenkilohakuPage = (props: Props) => {
    const [sorted, setSorted] = useState<{ id: string; desc: boolean }[]>([]);
    const [nameQuery, setNameQuery] = useState(props.henkiloHakuFilters.nameQuery);
    const [noOrganisation, setNoOrganisation] = useState(props.henkiloHakuFilters.noOrganisation);
    const [subOrganisation, setSubOrganisation] = useState(props.henkiloHakuFilters.subOrganisation);
    const [passivoitu, setPassivoitu] = useState(props.henkiloHakuFilters.passivoitu);
    const [duplikaatti, setDuplikaatti] = useState(props.henkiloHakuFilters.duplikaatti);
    const [organisaatioOids, setOrganisaatioOids] = useState(props.henkiloHakuFilters.organisaatioOids);
    const [kayttooikeusryhmaId, setKayttooikeusryhmaId] = useState(props.henkiloHakuFilters.kayttooikeusryhmaId);
    const [ryhmaOid, setRyhmaOid] = useState(props.henkiloHakuFilters.ryhmaOids?.[0]);
    const [page, setPage] = useState(0);
    const { L, locale } = useLocalisations();

    useEffect(() => {
        searchQuery();
        props.updateFilters({
            nameQuery,
            noOrganisation,
            subOrganisation,
            passivoitu,
            duplikaatti,
            organisaatioOids,
            kayttooikeusryhmaId,
            ryhmaOids: [ryhmaOid],
        });
    }, [nameQuery, noOrganisation, subOrganisation, passivoitu, duplikaatti, organisaatioOids, kayttooikeusryhmaId]);

    function onTableFetch(tableState: any) {
        const sort = tableState.sorted[0];
        const stateSort = sorted[0];
        // Update sort state
        if (sort) {
            setSorted([{ ...sort }]);
            // If sort state changed fetch new data
            if (!stateSort || sort.id !== stateSort.id || sort.desc !== stateSort.desc) {
                searchQuery(false);
            }
        }
    }

    function createRows(headingKeys: Array<string>) {
        return props.henkilohakuResult.map((henkilo) => ({
            [headingKeys[0]]: <Link to={`/virkailija/${henkilo.oidHenkilo}`}>{henkilo.nimi || ''}</Link>,
            [headingKeys[1]]: henkilo.kayttajatunnus || '',
            [headingKeys[2]]: (
                <ul>
                    {henkilo.organisaatioNimiList.map((organisaatio, idx2) => (
                        <li key={idx2}>
                            {(toLocalizedText(locale, organisaatio.localisedLabels) || organisaatio.identifier) +
                                ' ' +
                                StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, L, true)}
                        </li>
                    ))}
                </ul>
            ),
        }));
    }

    const selectRyhmaOid = (option: Option<string>) => {
        setRyhmaOid(option.value);
        setOrganisaatioOids(option.value ? [option.value] : undefined);
    };

    function searchQuery(shouldNotClear?: boolean): void {
        if (!shouldNotClear) {
            props.clearHenkilohaku();
        }
        if (nameQuery || organisaatioOids?.length || kayttooikeusryhmaId) {
            setPage(page + 1);
            const queryParams = {
                offset: shouldNotClear ? 100 * page : 0,
                orderBy: sorted.length ? (sorted[0].desc ? sorted[0].id + '_DESC' : sorted[0].id + '_ASC') : undefined,
            };

            const henkilohakuModel = {
                nameQuery,
                noOrganisation,
                subOrganisation,
                passivoitu,
                duplikaatti,
                organisaatioOids,
                kayttooikeusryhmaId,
            };

            const henkilohakuCriteria: HenkilohakuCriteria = {
                ...henkilohakuModel,
                isCountSearch: false,
            };

            const henkilohakuCountCriteria: HenkilohakuCriteria = {
                ...henkilohakuModel,
                isCountSearch: true,
            };

            props.henkilohakuAction(henkilohakuCriteria, queryParams);
            props.henkilohakuCount(henkilohakuCountCriteria);
        }
    }

    return (
        <div className="wrapper">
            <div className="oph-h2 oph-bold henkilohaku-main-header">{L['HENKILOHAKU_OTSIKKO']}</div>
            <DelayedSearchInput
                setSearchQueryAction={(s) => setNameQuery(s)}
                defaultNameQuery={nameQuery}
                loading={props.henkilohakuLoading}
                minSearchValueLength={2}
            />
            <HenkilohakuFilters
                noOrganisationAction={() => setNoOrganisation(!noOrganisation)}
                subOrganisationAction={() => setSubOrganisation(!subOrganisation)}
                duplikaatitAction={() => setDuplikaatti(!duplikaatti)}
                passiivisetAction={() => setPassivoitu(!passivoitu)}
                initialValues={{
                    nameQuery,
                    noOrganisation,
                    subOrganisation,
                    passivoitu,
                    duplikaatti,
                    organisaatioOids,
                    kayttooikeusryhmaId,
                }}
                selectedOrganisation={organisaatioOids}
                organisaatioSelectAction={(o) => setOrganisaatioOids([o.oid])}
                clearOrganisaatioSelection={() => setOrganisaatioOids(undefined)}
                selectedRyhma={ryhmaOid}
                ryhmaSelectionAction={selectRyhmaOid}
                selectedKayttooikeus={kayttooikeusryhmaId}
                kayttooikeusSelectionAction={(option: Option<string>) => {
                    setKayttooikeusryhmaId(option.value);
                }}
            />
            <div className="oph-h3 oph-bold henkilohaku-result-header">
                {L['HENKILOHAKU_HAKUTULOKSET']} (
                {props.henkilohakuLoading || props.henkilohakuResultCount === 0
                    ? L['HENKILOHAKU_EI_TULOKSIA']
                    : `${props.henkilohakuResultCount} ${L['HENKILOHAKU_OSUMA']}`}
                )
            </div>
            {props.henkilohakuResult.length ? (
                <div className="henkilohakuTableWrapper">
                    <Table
                        headings={columnHeaders.map((template) =>
                            Object.assign({}, template, {
                                label: L[template.key] || template.key,
                            })
                        )}
                        data={createRows(columnHeaders.map((template) => template.key))}
                        noDataText=""
                        striped
                        highlight
                        manual
                        defaultSorted={sorted}
                        onFetchData={onTableFetch}
                        fetchMoreSettings={{
                            isActive:
                                props.henkilohakuResult.length !== props.henkilohakuResultCount &&
                                !props.henkilohakuLoading,
                            fetchMoreAction: () => searchQuery(true),
                        }}
                        isLoading={props.henkilohakuLoading}
                    />
                </div>
            ) : (
                props.henkilohakuLoading && <Loader />
            )}
        </div>
    );
};

export default HenkilohakuPage;
