import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useReactTable, getCoreRowModel, PaginationState, ColumnDef } from '@tanstack/react-table';

import { OppijaList } from '../../types/domain/oppijanumerorekisteri/oppijalist.types';
import { Page } from '../../types/Page.types';
import { useLocalisations } from '../../selectors';
import OphTable from '../OphTable';
import { format, parseISO } from 'date-fns';

type Props = {
    data: Page<OppijaList>;
    onPageChange: (pageNumber: number, pageSize: number) => void;
    loading: boolean;
};

const emptyData: OppijaList[] = [];
const emptyColumns: ColumnDef<OppijaList>[] = [];

/**
 * Oppijoiden tuonnin listausnäkymä.
 */
const OppijoidenTuontiListaus = ({ data, onPageChange, loading }: Props) => {
    const { L } = useLocalisations();

    const YKSILOINTI_TILAT = {
        OK: '',
        VIRHE: L('YKSILOINTI_TILA_VIRHE'),
        KESKEN: L('YKSILOINTI_TILA_KESKEN'),
        HETU_PUUTTUU: L('YKSILOINTI_TILA_HETU_PUUTTUU'),
    };

    function renderOppijaLinkki(henkilo: OppijaList) {
        const linkki = `/oppija/${henkilo.oid}`;
        const nimi = `${henkilo.sukunimi}, ${henkilo.etunimet}`;
        return <Link to={linkki}>{nimi}</Link>;
    }

    const columns = useMemo<ColumnDef<OppijaList, OppijaList>[]>(
        () => [
            {
                header: () => L('OPPIJOIDEN_TUONTI_LUONTIAIKA'),
                accessorFn: (henkilo: OppijaList) => format(new Date(henkilo.luotu), 'd.M.yyyy HH:mm'),
                id: 'CREATED',
                enableSorting: false,
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_KASITTELIJA'),
                accessorFn: (henkilo: OppijaList) => henkilo,
                cell: ({ getValue }) =>
                    getValue().serviceUserOid ? (
                        <Link to={`/virkailija/${getValue().serviceUserOid}`}>{getValue().serviceUserName}</Link>
                    ) : null,
                enableSorting: false,
                id: 'kasittelija',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_OID'),
                accessorFn: (henkilo: OppijaList) => henkilo.oid,
                enableSorting: false,
                id: 'oid',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_HENKILOTUNNUS_SYNTYMAIKA'),
                accessorFn: (henkilo: OppijaList) =>
                    henkilo.syntymaaika ? format(parseISO(henkilo.syntymaaika), 'd.M.yyyy') : '',
                enableSorting: false,
                id: 'hetu',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_NIMI'),
                accessorFn: (henkilo: OppijaList) => henkilo,
                cell: ({ getValue }) => renderOppijaLinkki(getValue()),
                id: 'NAME',
                enableSorting: false,
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_VIRHEET'),
                accessorFn: (henkilo: OppijaList) => YKSILOINTI_TILAT[henkilo.yksilointiTila] ?? '',
                enableSorting: false,
                id: 'virheet',
            },
        ],
        [data]
    );

    const pagination: PaginationState = useMemo(
        () => ({
            pageIndex: data?.number ? data?.number - 1 : 0,
            pageSize: data?.size ?? 20,
        }),
        [data]
    );

    const memoizedData = useMemo(() => {
        const renderedData = data?.results;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [data]);

    const table = useReactTable<OppijaList>({
        data: memoizedData ?? emptyData,
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
        manualSorting: true,
        columns: columns ?? emptyColumns,
        columnResizeMode: 'onChange',
    });

    return <OphTable table={table} isLoading={loading} />;
};

export default OppijoidenTuontiListaus;
