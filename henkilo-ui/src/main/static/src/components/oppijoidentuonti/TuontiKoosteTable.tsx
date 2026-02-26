import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, PaginationState, ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import { format } from 'date-fns';

import { TuontiKoosteRivi, TuontiKoosteCriteria } from '../../types/tuontikooste.types';
import TextButton from '../common/button/TextButton';
import TuontiDetails from './TuontiDetails';
import { hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useGetTuontikoosteQuery } from '../../api/oppijanumerorekisteri';
import { useDebounce } from '../../useDebounce';
import OphTable from '../OphTable';

const emptyData: TuontiKoosteRivi[] = [];
const emptyColumns: ColumnDef<TuontiKoosteRivi>[] = [];

const TuontiKoosteTable = () => {
    const [criteria, setCriteria] = useState<TuontiKoosteCriteria>({
        id: '',
        author: '',
        page: '1',
        pageSize: '20',
        field: 'id',
        sort: 'DESC',
    });
    const debouncedCriteria = useDebounce(criteria, 500);
    const [showDetails, setShowDetails] = useState<number | undefined>(undefined);
    const onClose = () => setShowDetails(undefined);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { L } = useLocalisations();
    const { data, isFetching } = useGetTuontikoosteQuery({ L, criteria: debouncedCriteria });

    const canViewDetails = hasAnyPalveluRooli(omattiedot?.organisaatiot, [
        'OPPIJANUMEROREKISTERI_TUONTIDATA_READ',
        'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
    ]);

    const columns = useMemo<ColumnDef<TuontiKoosteRivi, TuontiKoosteRivi>[]>(
        () => [
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID'),
                accessorFn: (tuonti) => tuonti,
                cell: ({ getValue }) =>
                    getValue()?.conflicts && canViewDetails ? (
                        <TextButton action={() => setShowDetails(getValue()?.id)}>{getValue()?.id}</TextButton>
                    ) : (
                        getValue()?.id
                    ),
                id: 'id',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_AIKALEIMA'),
                accessorFn: (tuonti) => format(new Date(tuonti.timestamp), 'd.M.yyyy HH:mm'),
                id: 'timestamp',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KASITTELIJA'),
                accessorFn: (tuonti) => tuonti,
                cell: ({ getValue }) => <Link to={`/virkailija/${getValue()?.oid}`}>{getValue()?.author}</Link>,
                id: 'author',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_TOTAL'),
                accessorFn: (tuonti) => tuonti.total,
                id: 'total',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ONNISTUNEET'),
                accessorFn: (tuonti) => tuonti.successful,
                id: 'successful',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_VIRHEET'),
                accessorFn: (tuonti) => tuonti.failures,
                id: 'failures',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KONFLIKTIT'),
                accessorFn: (tuonti) => tuonti.conflicts,
                id: 'conflicts',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_STATUS'),
                accessorFn: (tuonti) => tuonti,
                cell: ({ getValue }) => (getValue().inProgress ? null : <i className="fa fa-check" />),
                id: 'inProgress',
            },
            {
                header: () => L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_API') ?? '',
                accessorFn: (tuonti) => tuonti.api ?? L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_EI_APIA'),
                enableSorting: false,
                id: 'api',
            },
        ],
        [data]
    );

    const pagination: PaginationState = useMemo(
        () => ({
            pageIndex: data?.pageable.pageNumber ?? 0,
            pageSize: data?.pageable.pageSize ?? 20,
        }),
        [data]
    );

    const memoizedData = useMemo(() => {
        const renderedData = data?.content;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [data]);

    const table = useReactTable<TuontiKoosteRivi>({
        data: memoizedData ?? emptyData,
        columns: columns ?? emptyColumns,
        pageCount: data?.totalPages ?? 0,
        state: {
            pagination,
            sorting: [{ id: criteria.field, desc: criteria.sort === 'DESC' }],
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater({
                    pageIndex: data?.pageable.pageNumber ?? 0,
                    pageSize: data?.pageable.pageSize ?? 20,
                });
                setCriteria({
                    ...criteria,
                    page: String(nextState.pageIndex + 1),
                    pageSize: String(nextState.pageSize),
                });
            }
        },
        onSortingChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater([{ id: criteria.field, desc: criteria.sort === 'DESC' }]);
                setCriteria({
                    ...criteria,
                    field: nextState[0]?.id as TuontiKoosteCriteria['field'],
                    sort: nextState[0]?.desc ? 'DESC' : 'ASC',
                });
            }
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        columnResizeMode: 'onChange',
    });

    return (
        <>
            <div style={{ display: 'flex' }}>
                <div style={{ margin: '0 2rem 1rem 0' }}>
                    <div>
                        <label htmlFor="tuontikooste-id">{L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID')}</label>
                    </div>
                    <input
                        className="oph-input"
                        id="tuontikooste-id"
                        type="number"
                        autoComplete="off"
                        value={criteria.id || ''}
                        onChange={(e) => setCriteria({ ...criteria, id: e.target.value })}
                    />
                </div>
                <div style={{ margin: '0 2rem 1rem 0' }}>
                    <div>
                        <label htmlFor="tuontikooste-author">{L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KASITTELIJA')}</label>
                    </div>
                    <input
                        className="oph-input"
                        id="tuontikooste-author"
                        autoComplete="off"
                        value={criteria.author || ''}
                        onChange={(e) => setCriteria({ ...criteria, author: e.target.value })}
                    />
                </div>
            </div>
            {!!showDetails && <TuontiDetails tuontiId={showDetails} onClose={onClose} />}
            <OphTable<TuontiKoosteRivi> table={table} isLoading={isFetching} />
        </>
    );
};

export default TuontiKoosteTable;
