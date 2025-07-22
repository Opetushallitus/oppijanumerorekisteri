import './HenkilohakuPage.css';
import React, { useEffect, useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';
import { Link } from 'react-router';

import HenkilohakuFilters from './HenkilohakuFilters';
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
import { useSelector } from 'react-redux';
import { HenkilohakuState } from '../../reducers/henkilohaku.reducer';
import { RootState, useAppDispatch } from '../../store';
import { updateFilters } from '../../actions/henkilohaku.actions';
import { useGetHenkiloHakuCountQuery, useGetHenkiloHakuQuery } from '../../api/kayttooikeus';
import { useDebounce } from '../../useDebounce';
import { SelectOption } from '../../utilities/select';

const emptyArray = [];

const HenkilohakuPage = () => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [sorting, setSorting] = useState<SortingState>([]);
    const { filters } = useSelector<RootState, HenkilohakuState>((state) => state.henkilohakuState);
    const [ryhmaOid, setRyhmaOid] = useState(filters.ryhmaOid);
    const [criteria, setCriteria] = useState<HenkilohakuCriteria>(filters);
    const debounced = useDebounce(criteria, 500);
    const [parameters, setParameters] = useState<HenkilohakuQueryparameters>({
        offset: '0',
        orderBy: 'HENKILO_NIMI_ASC',
    });
    const skip = !debounced.nameQuery && !debounced.organisaatioOids?.length && !debounced.kayttooikeusryhmaId;
    const { data: result, isFetching } = useGetHenkiloHakuQuery({ criteria: debounced, parameters }, { skip });
    const { data: resultCount } = useGetHenkiloHakuCountQuery(debounced, { skip });

    useEffect(() => {
        dispatch(updateFilters({ ...criteria, ryhmaOid }));
        setParameters({ ...parameters, offset: '0' });
    }, [criteria, ryhmaOid]);

    useEffect(() => {
        setParameters({
            offset: String(0),
            orderBy: sorting.length
                ? sorting[0].desc
                    ? sorting[0].id + '_DESC'
                    : sorting[0].id + '_ASC'
                : 'HENKILO_NIMI_ASC',
        });
    }, [sorting]);

    const selectRyhmaOid = (option?: SelectOption) => {
        setRyhmaOid(option?.value);
        setCriteria({ ...criteria, organisaatioOids: option?.value ? [option.value] : undefined });
    };

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

    const memoizedData = useMemo(() => {
        const renderedData = result;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [result]);

    const table = useReactTable({
        columns: columns ?? emptyArray,
        data: memoizedData ?? emptyArray,
        pageCount: 1,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="mainContent wrapper">
            <div className="oph-h2 oph-bold henkilohaku-main-header">{L['HENKILOHAKU_OTSIKKO']}</div>
            <input
                className="oph-input"
                defaultValue={criteria.nameQuery}
                onChange={(e) => setCriteria({ ...criteria, nameQuery: e.target.value })}
            />
            <HenkilohakuFilters
                noOrganisationAction={() => setCriteria({ ...criteria, noOrganisation: !criteria.noOrganisation })}
                subOrganisationAction={() => setCriteria({ ...criteria, subOrganisation: !criteria.subOrganisation })}
                duplikaatitAction={() => setCriteria({ ...criteria, duplikaatti: !criteria.duplikaatti })}
                passiivisetAction={() => setCriteria({ ...criteria, passivoitu: !criteria.passivoitu })}
                initialValues={criteria}
                selectedOrganisation={criteria.organisaatioOids}
                organisaatioSelectAction={(o) => setCriteria({ ...criteria, organisaatioOids: [o.oid] })}
                clearOrganisaatioSelection={() => setCriteria({ ...criteria, organisaatioOids: undefined })}
                selectedRyhma={ryhmaOid}
                ryhmaSelectionAction={selectRyhmaOid}
                selectedKayttooikeus={criteria.kayttooikeusryhmaId}
                kayttooikeusSelectionAction={(option: SelectOption) =>
                    setCriteria({ ...criteria, kayttooikeusryhmaId: option?.value })
                }
            />
            <div className="oph-h3 oph-bold henkilohaku-result-header">
                {L['HENKILOHAKU_HAKUTULOKSET']} (
                {isFetching
                    ? '...'
                    : !resultCount || resultCount === '0'
                    ? L['HENKILOHAKU_EI_TULOKSIA']
                    : `${resultCount} ${L['HENKILOHAKU_OSUMA']}`}
                )
            </div>
            {!!result?.length && (
                <div className="henkilohakuTableWrapper">
                    <OphTableWithInfiniteScroll
                        table={table}
                        isLoading={isFetching}
                        fetch={() => setParameters({ ...parameters, offset: String(Number(result.length) + 100) })}
                        isActive={
                            !!result.length && !!resultCount && String(result.length) !== resultCount && !isFetching
                        }
                    />
                </div>
            )}
            {!result?.length && isFetching && <Loader />}
        </div>
    );
};

export default HenkilohakuPage;
