import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useReactTable, getCoreRowModel, PaginationState } from '@tanstack/react-table';
import moment from 'moment';

import { OppijaList } from '../../types/domain/oppijanumerorekisteri/oppijalist.types';
import SortIconNone from '../common/icons/SortIconNone';
import SortAscIcon from '../common/icons/SortAscIcon';
import SortDescIcon from '../common/icons/SortDescIcon';
import { Page } from '../../types/Page.types';
import { useLocalisations } from '../../selectors';
import OphTable from '../OphTable';

import './OppijoidenTuontiListaus.css';

type Props = {
    data: Page<OppijaList>;
    onPageChange: (pageNumber: number, pageSize: number) => void;
    onSortingChange: (arg0: string, arg1: string) => void;
    sortKey: string;
    sortDirection: string;
    loading: boolean;
};

/**
 * Oppijoiden tuonnin listausnäkymä.
 */
const OppijoidenTuontiListaus = ({ data, onPageChange, onSortingChange, sortKey, sortDirection, loading }: Props) => {
    const { L } = useLocalisations();

    function renderHeader(localizationKey: string) {
        return <span className="oph-bold">{L[localizationKey]}</span>;
    }

    function renderSortIcon() {
        return sortDirection === 'ASC' ? <SortAscIcon /> : <SortDescIcon />;
    }

    const YKSILOINTI_TILAT = {
        OK: '',
        VIRHE: L['YKSILOINTI_TILA_VIRHE'],
        KESKEN: L['YKSILOINTI_TILA_KESKEN'],
        HETU_PUUTTUU: L['YKSILOINTI_TILA_HETU_PUUTTUU'],
    };

    function renderOppijaLinkki(henkilo: OppijaList) {
        const linkki = `oppija/${henkilo.oid}`;
        const nimi = `${henkilo.sukunimi}, ${henkilo.etunimet}`;
        return <Link to={linkki}>{nimi}</Link>;
    }

    function renderSortableHeader(localizationKey: string, headerKey: string) {
        const newSortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
        return (
            <button
                style={{ display: 'block' }}
                onClick={() => onSortingChange(headerKey, newSortDirection)}
                className="reset-button-styles oph-bold sortable-header"
            >
                {L[localizationKey]} {sortKey === headerKey ? renderSortIcon() : <SortIconNone />}
            </button>
        );
    }

    const columns = useMemo(
        () => [
            {
                header: () => renderSortableHeader('OPPIJOIDEN_TUONTI_LUONTIAIKA', 'CREATED'),
                accessorFn: (henkilo: OppijaList) => moment(henkilo.luotu).format('l LT'),
                id: 'luotu',
            },
            {
                header: () => renderHeader('OPPIJOIDEN_TUONTI_KASITTELIJA'),
                accessorFn: (henkilo: OppijaList) => henkilo,
                cell: ({ getValue }) =>
                    getValue().serviceUserOid ? (
                        <Link to={`virkailija/${getValue().serviceUserOid}`}>{getValue().serviceUserName}</Link>
                    ) : null,
                id: 'kasittelija',
            },
            {
                header: () => renderHeader('OPPIJOIDEN_TUONTI_OID'),
                accessorFn: (henkilo: OppijaList) => henkilo.oid,
                id: 'oid',
            },
            {
                header: () => renderHeader('OPPIJOIDEN_TUONTI_HENKILOTUNNUS_SYNTYMAIKA'),
                accessorFn: (henkilo: OppijaList) =>
                    henkilo.syntymaaika ? moment(henkilo.syntymaaika).format('l') : '',
                id: 'hetu',
            },
            {
                header: () => renderSortableHeader('OPPIJOIDEN_TUONTI_NIMI', 'NAME'),
                accessorFn: (henkilo: OppijaList) => henkilo,
                cell: ({ getValue }) => renderOppijaLinkki(getValue()),
                id: 'nimi',
            },
            {
                header: () => renderHeader('OPPIJOIDEN_TUONTI_VIRHEET'),
                accessorFn: (henkilo: OppijaList) => YKSILOINTI_TILAT[henkilo.yksilointiTila] ?? '',
                id: 'virheet',
            },
        ],
        [data]
    );

    const pagination: PaginationState = useMemo(
        () => ({
            pageIndex: data?.number - 1 ?? 0,
            pageSize: data?.size ?? 20,
        }),
        [data]
    );

    const table = useReactTable<OppijaList>({
        data: data?.results ?? [],
        pageCount: data?.totalPages ?? 0,
        state: {
            pagination,
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater({
                    pageIndex: data?.number - 1,
                    pageSize: data?.size,
                });
                onPageChange(nextState.pageIndex + 1, nextState.pageSize);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        columns,
        columnResizeMode: 'onChange',
    });

    return <OphTable table={table} isLoading={loading} />;
};

export default OppijoidenTuontiListaus;
