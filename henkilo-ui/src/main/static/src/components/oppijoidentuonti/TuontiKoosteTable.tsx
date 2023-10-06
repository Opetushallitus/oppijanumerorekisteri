import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, PaginationState, ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router';
import moment from 'moment';

import { TuontiKoosteRivi, TuontiKoosteCriteria } from '../../types/tuontikooste.types';
import TextButton from '../common/button/TextButton';
import TuontiDetails from './TuontiDetails';
import SortIconNone from '../common/icons/SortIconNone';
import SortAscIcon from '../common/icons/SortAscIcon';
import SortDescIcon from '../common/icons/SortDescIcon';
import { hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useGetTuontikoosteQuery } from '../../api/oppijanumerorekisteri';
import { useDebounce } from '../../useDebounce';
import OphTable from '../OphTable';

import styles from './TuontiKoosteTable.module.css';

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
    const [showDetails, setShowDetails] = useState<number>(undefined);
    const onClose = () => setShowDetails(undefined);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { L } = useLocalisations();
    const { data, isFetching } = useGetTuontikoosteQuery({ L, criteria: debouncedCriteria });

    const renderSortIcon = (sort: TuontiKoosteCriteria['sort']) =>
        sort === 'ASC' ? <SortAscIcon /> : <SortDescIcon />;

    const canViewDetails = hasAnyPalveluRooli(omattiedot.organisaatiot, [
        'OPPIJANUMEROREKISTERI_TUONTIDATA_READ',
        'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
    ]);

    const TableHeader: React.FC<{ field: TuontiKoosteCriteria['field']; translationKey: string }> = ({
        field,
        translationKey,
    }) => (
        <button
            style={{ display: 'block' }}
            onClick={() =>
                setCriteria({
                    ...criteria,
                    field,
                    sort: criteria.field === field && criteria.sort === 'ASC' ? 'DESC' : 'ASC',
                })
            }
            className="reset-button-styles oph-bold sortable-header"
        >
            {L[translationKey]} {criteria.field === field ? renderSortIcon(criteria.sort) : <SortIconNone />}
        </button>
    );

    const columns = useMemo<ColumnDef<TuontiKoosteRivi, TuontiKoosteRivi>[]>(
        () => [
            {
                header: () => <TableHeader field="id" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID" />,
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
                header: () => (
                    <TableHeader field="timestamp" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_AIKALEIMA" />
                ),
                accessorFn: (tuonti) => moment(tuonti.timestamp).format('l LT'),
                id: 'timestamp',
            },
            {
                header: () => (
                    <TableHeader field="author" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KASITTELIJA" />
                ),
                accessorFn: (tuonti) => tuonti,
                cell: ({ getValue }) => <Link to={`virkailija/${getValue()?.oid}`}>{getValue()?.author}</Link>,
                id: 'author',
            },
            {
                header: () => <TableHeader field="total" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_TOTAL" />,
                accessorFn: (tuonti) => tuonti.total,
                id: 'total',
            },
            {
                header: () => (
                    <TableHeader field="successful" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ONNISTUNEET" />
                ),
                accessorFn: (tuonti) => tuonti.successful,
                id: 'successful',
            },
            {
                header: () => <TableHeader field="failures" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_VIRHEET" />,
                accessorFn: (tuonti) => tuonti.failures,
                id: 'failures',
            },
            {
                header: () => (
                    <TableHeader field="conflicts" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KONFLIKTIT" />
                ),
                accessorFn: (tuonti) => tuonti.conflicts,
                id: 'conflicts',
            },
            {
                header: () => <TableHeader field="inProgress" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_STATUS" />,
                accessorFn: (tuonti) => tuonti,
                cell: ({ getValue }) => (getValue().inProgress ? null : <i className="fa fa-check" />),
                id: 'inProgress',
            },
        ],
        [data]
    );

    const pagination: PaginationState = useMemo(
        () => ({
            pageIndex: data?.pageable.pageNumber - 1 ?? 0,
            pageSize: data?.pageable.pageSize ?? 20,
        }),
        [data]
    );

    const table = useReactTable<TuontiKoosteRivi>({
        data: data?.content ?? [],
        pageCount: data?.totalPages ?? 0,
        state: {
            pagination,
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater({
                    pageIndex: data?.pageable.pageNumber - 1,
                    pageSize: data?.pageable.pageSize,
                });
                setCriteria({
                    ...criteria,
                    page: String(nextState.pageIndex + 1),
                    pageSize: String(nextState.pageSize),
                });
            }
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        columns,
        columnResizeMode: 'onChange',
    });

    return (
        <>
            <div className={styles.searchForm}>
                <div className={styles.searchInput}>
                    <div>
                        <label htmlFor="tuontikooste-id">{L['OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID']}</label>
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
                <div className={styles.searchInput}>
                    <div>
                        <label htmlFor="tuontikooste-author">{L['OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KASITTELIJA']}</label>
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
