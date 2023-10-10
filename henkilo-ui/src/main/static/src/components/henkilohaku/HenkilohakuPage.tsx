import './HenkilohakuPage.css';
import React, { useEffect, useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';
import { Link } from 'react-router';
import { Option } from 'react-select';

import HenkilohakuFilters from './HenkilohakuFilters';
import DelayedSearchInput from './DelayedSearchInput';
import StaticUtils from '../common/StaticUtils';
import Loader from '../common/icons/Loader';
import { toLocalizedText } from '../../localizabletext';
import {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters,
} from '../../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HenkilohakuResult } from '../../types/domain/kayttooikeus/HenkilohakuResult.types';
import { useLocalisations } from '../../selectors';
import { OphTableWithInfiniteScroll } from '../OphTableWithInfiniteScroll';

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

const HenkilohakuPage = (props: Props) => {
    const [sorting, setSorting] = useState<SortingState>([]);
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
    }, [
        nameQuery,
        noOrganisation,
        subOrganisation,
        passivoitu,
        duplikaatti,
        organisaatioOids,
        kayttooikeusryhmaId,
        sorting,
    ]);

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
                orderBy: sorting.length
                    ? sorting[0].desc
                        ? sorting[0].id + '_DESC'
                        : sorting[0].id + '_ASC'
                    : undefined,
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

    const columns = useMemo<ColumnDef<HenkilohakuResult, HenkilohakuResult>[]>(
        () => [
            {
                id: 'HENKILO_NIMI',
                header: () => L['HENKILO_NIMI'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <Link to={`/virkailija/${getValue().oidHenkilo}`}>{getValue().nimi ?? ''}</Link>
                ),
                sortingFn: (a: Row<HenkilohakuResult>, b: Row<HenkilohakuResult>) =>
                    a.original.nimi.localeCompare(b.original.nimi),
            },
            {
                id: 'USERNAME',
                header: () => L['USERNAME'],
                accessorFn: (row) => row.kayttajatunnus ?? '',
            },
            {
                id: 'HENKILOHAKU_ORGANISAATIO',
                header: () => L['HENKILOHAKU_ORGANISAATIO'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <ul>
                        {getValue().organisaatioNimiList.map((organisaatio, idx2) => (
                            <li key={idx2}>
                                {(toLocalizedText(locale, organisaatio.localisedLabels) || organisaatio.identifier) +
                                    ' ' +
                                    StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, L, true)}
                            </li>
                        ))}
                    </ul>
                ),
                enableSorting: false,
            },
        ],
        []
    );

    const table = useReactTable({
        columns,
        data: props.henkilohakuResult,
        pageCount: 1,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

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
                    <OphTableWithInfiniteScroll
                        table={table}
                        isLoading={props.henkilohakuLoading}
                        fetch={() => searchQuery(true)}
                        isActive={
                            props.henkilohakuResult.length !== props.henkilohakuResultCount && !props.henkilohakuLoading
                        }
                    />
                </div>
            ) : (
                props.henkilohakuLoading && <Loader />
            )}
        </div>
    );
};

export default HenkilohakuPage;
