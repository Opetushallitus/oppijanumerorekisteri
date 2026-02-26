import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';
import { addMonths, format, isBefore, parseISO } from 'date-fns';

import Button from '../common/button/Button';
import PopupButton from '../common/button/PopupButton';
import KutsuDetails from './KutsuDetails';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { useLocalisations } from '../../selectors';
import { useAppDispatch } from '../../store';
import { OphTableWithInfiniteScroll } from '../OphTableWithInfiniteScroll';
import { expanderColumn } from '../OphTable';
import { KutsututSearchParams } from './KutsututPage';
import { KutsututSortBy, useGetKutsututInfiniteQuery, usePutRenewKutsuMutation } from '../../api/kayttooikeus';
import { add } from '../../slices/toastSlice';

type OwnProps = {
    params: KutsututSearchParams;
    cancelInvitation: (kutsu: KutsuRead) => void;
};

const emptyData: KutsuRead[] = [];
const emptyColumns: ColumnDef<KutsuRead>[] = [];

const KutsututTable = ({ params, cancelInvitation }: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'AIKALEIMA', desc: true }]);
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const [renewKutsu] = usePutRenewKutsuMutation();
    const { data, isFetching, fetchNextPage, hasNextPage } = useGetKutsututInfiniteQuery({
        params,
        sortBy: (sorting[0]?.id ?? 'AIKALEIMA') as KutsututSortBy,
        direction: sorting[0]?.desc ? 'DESC' : 'ASC',
        amount: String(40),
    });

    const resendAction = async (id: number) => {
        renewKutsu(id)
            .unwrap()
            .then(() =>
                dispatch(
                    add({
                        id: `KUTSU_CONFIRMATION_SUCCESS-${Math.random()}`,
                        type: 'ok',
                        header: L('KUTSU_LUONTI_ONNISTUI'),
                    })
                )
            );
    };

    const columns = useMemo<ColumnDef<KutsuRead, KutsuRead>[]>(
        () => [
            expanderColumn(),
            {
                id: 'NIMI',
                header: () => L('KUTSUT_NIMI_OTSIKKO'),
                accessorFn: (row) => `${row.etunimi} ${row.sukunimi}`,
            },
            {
                id: 'SAHKOPOSTI',
                header: () => L('KUTSUT_SAHKOPOSTI_OTSIKKO'),
                accessorFn: (row) => row.sahkoposti,
            },
            {
                id: 'KUTSUTUT_ORGANISAATIO_OTSIKKO',
                header: () => L('KUTSUTUT_ORGANISAATIO_OTSIKKO'),
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <div>
                        {getValue().organisaatiot.map((org) => (
                            <div key={org.organisaatioOid}>{org.nimi[locale] ?? org.organisaatioOid}</div>
                        ))}
                    </div>
                ),
                enableSorting: false,
            },
            {
                id: 'AIKALEIMA',
                header: () => L('KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO'),
                accessorFn: (row) => row,
                cell: ({ getValue }) => {
                    const sent = parseISO(getValue().aikaleima);
                    return (
                        <span>
                            {format(sent, 'd.M.yyyy HH:mm')}{' '}
                            {isBefore(addMonths(sent, 1), new Date()) ? (
                                <span className="oph-red">{L('KUTSUTUT_VIRKAILIJAT_KUTSU_VANHENTUNUT')}</span>
                            ) : null}
                        </span>
                    );
                },
                sortingFn: (a: Row<KutsuRead>, b: Row<KutsuRead>) =>
                    a.original.aikaleima.localeCompare(b.original.aikaleima),
            },
            {
                id: 'KUTSUTUT_SAATE_OTSIKKO',
                header: () => L('KUTSUTUT_SAATE_OTSIKKO'),
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    getValue().saate ? (
                        <PopupButton
                            popupClass={'oph-popup-default oph-popup-bottom'}
                            popupButtonWrapperPositioning="relative"
                            popupArrowStyles={{ marginLeft: '10px' }}
                            popupButtonClasses={'oph-button oph-button-ghost'}
                            simple={true}
                            popupContent={<p>{getValue().saate}</p>}
                        >
                            {L('AVAA')}
                        </PopupButton>
                    ) : (
                        ''
                    ),
                enableSorting: false,
            },
            {
                id: 'KUTSUTUT_LAHETA_UUDELLEEN',
                header: () => L('KUTSUTUT_LAHETA_UUDELLEEN'),
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    getValue().tila === 'AVOIN' && (
                        <Button action={() => resendAction(getValue().id)}>
                            {L('KUTSUTUT_LAHETA_UUDELLEEN_NAPPI')}
                        </Button>
                    ),
                enableSorting: false,
            },
            {
                id: 'KUTSU_PERUUTA',
                header: () => L('KUTSUTUT_PERUUTA_KUTSU'),
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    getValue().tila === 'AVOIN' && (
                        <Button cancel action={() => cancelInvitation(getValue())}>
                            {L('KUTSUTUT_PERUUTA_KUTSU_NAPPI')}
                        </Button>
                    ),
                enableSorting: false,
            },
        ],
        []
    );

    const memoizedData = useMemo(() => {
        const renderedData = data?.pages.flat();
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [data]);
    const table = useReactTable({
        columns: columns ?? emptyColumns,
        data: memoizedData ?? emptyData,
        pageCount: 1,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowCanExpand: () => true,
    });

    return (
        <div className="kutsututTableWrapper">
            <OphTableWithInfiniteScroll<KutsuRead>
                table={table}
                isLoading={isFetching}
                fetch={() => fetchNextPage()}
                isActive={!isFetching && hasNextPage}
                renderSubComponent={({ row }) => (
                    <KutsuDetails kutsu={memoizedData?.find((kutsu) => kutsu.id === row.original.id)} />
                )}
            />
        </div>
    );
};

export default KutsututTable;
