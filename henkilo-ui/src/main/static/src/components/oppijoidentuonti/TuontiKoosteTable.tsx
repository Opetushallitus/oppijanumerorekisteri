import React, { useState } from 'react';
import ReactTable from 'react-table';
import { Link } from 'react-router';
import moment from 'moment';

import { TuontiKoosteRivi, TuontiKoosteCriteria } from '../../types/tuontikooste.types';
import TableLoader from '../common/icons/TableLoader';
import '../../oph-table.css';
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
    const [showDetails, setShowDetails] = React.useState<number>(undefined);
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

    const columns = [
        {
            Header: <TableHeader field="id" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID" />,
            accessor: (tuonti: TuontiKoosteRivi) =>
                tuonti.conflicts && canViewDetails ? (
                    <TextButton action={() => setShowDetails(tuonti.id)}>{tuonti.id}</TextButton>
                ) : (
                    tuonti.id
                ),
            id: 'id',
        },
        {
            Header: <TableHeader field="timestamp" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_AIKALEIMA" />,
            accessor: (tuonti: TuontiKoosteRivi) => moment(tuonti.timestamp).format('l LT'),
            id: 'timestamp',
        },
        {
            Header: <TableHeader field="author" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KASITTELIJA" />,
            accessor: (tuonti: TuontiKoosteRivi) => <Link to={`virkailija/${tuonti.oid}`}>{tuonti.author}</Link>,
            id: 'author',
        },
        {
            Header: <TableHeader field="total" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_TOTAL" />,
            accessor: (tuonti: TuontiKoosteRivi) => tuonti.total,
            id: 'total',
        },
        {
            Header: <TableHeader field="successful" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ONNISTUNEET" />,
            accessor: (tuonti: TuontiKoosteRivi) => tuonti.successful,
            id: 'successful',
        },
        {
            Header: <TableHeader field="failures" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_VIRHEET" />,
            accessor: (tuonti: TuontiKoosteRivi) => tuonti.failures,
            id: 'failures',
        },
        {
            Header: <TableHeader field="conflicts" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_KONFLIKTIT" />,
            accessor: (tuonti: TuontiKoosteRivi) => tuonti.conflicts,
            id: 'conflicts',
        },
        {
            Header: <TableHeader field="inProgress" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_STATUS" />,
            accessor: (tuonti: TuontiKoosteRivi) => (tuonti.inProgress ? null : <i className="fa fa-check" />),
            id: 'inProgress',
        },
    ];

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
            <div className="oph-table">
                {!!showDetails && <TuontiDetails tuontiId={showDetails} onClose={onClose} />}
                <ReactTable
                    data={data?.content}
                    pages={data?.totalPages}
                    columns={columns}
                    sortable={false}
                    previousText={L['TAULUKKO_EDELLINEN']}
                    nextText={L['TAULUKKO_SEURAAVA']}
                    noDataText={L['TAULUKKO_EI_RIVEJA']}
                    pageText={L['TAULUKKO_SIVU']}
                    ofText="/"
                    rowsText={L['TAULUKKO_RIVIA']}
                    loading={isFetching}
                    LoadingComponent={TableLoader}
                    className="OppijoidenTuontiListaus table -striped"
                    manual
                    onFetchData={(state) => {
                        setCriteria({
                            ...criteria,
                            page: String(state.page + 1),
                            pageSize: String(state.pageSize),
                        });
                    }}
                ></ReactTable>
            </div>
        </>
    );
};

export default TuontiKoosteTable;
