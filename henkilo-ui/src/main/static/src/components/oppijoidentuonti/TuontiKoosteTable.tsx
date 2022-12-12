import React from 'react';
import ReactTable from 'react-table';
import { Link } from 'react-router';
import moment from 'moment';
import { TuontiKooste, TuontiKoosteRivi, TuontiKoosteCriteria } from '../../types/tuontikooste.types';
import TableLoader from '../common/icons/TableLoader';
import '../../oph-table.css';
import SortIconNone from '../common/icons/SortIconNone';
import SortAscIcon from '../common/icons/SortAscIcon';
import SortDescIcon from '../common/icons/SortDescIcon';

type Props = {
    criteria: TuontiKoosteCriteria;
    fetch: (criteria: TuontiKoosteCriteria) => void;
    setCriteria: (criteria: TuontiKoosteCriteria) => void;
    loading: boolean;
    data: TuontiKooste;
    translate: (key: string) => string;
};

const TuontiKoosteTable: React.FC<Props> = ({ fetch, criteria, setCriteria, loading, data, translate }) => {
    const firstRender = React.useRef(true);

    const skipFetchOnMount = () => (firstRender.current = false);

    React.useEffect(() => {
        firstRender.current ? skipFetchOnMount() : fetch(criteria);
    }, [fetch, criteria]);

    const renderSortIcon = (sort: TuontiKoosteCriteria['sort']) =>
        sort === 'ASC' ? <SortAscIcon /> : <SortDescIcon />;

    const TableHeader: React.FC<{ field: TuontiKoosteCriteria['field']; translationKey: string }> = ({
        field,
        translationKey,
    }) => (
        <span
            style={{ display: 'block' }}
            onClick={() =>
                setCriteria({
                    ...criteria,
                    field,
                    sort: criteria.field === field && criteria.sort === 'ASC' ? 'DESC' : 'ASC',
                })
            }
            className="oph-bold sortable-header"
        >
            {translate(translationKey)}
            {criteria.field === field ? renderSortIcon(criteria.sort) : <SortIconNone />}
        </span>
    );

    const columns = [
        {
            Header: <TableHeader field="id" translationKey="OPPIJOIDEN_TUONTI_TUONTIKOOSTE_ID" />,
            accessor: (tuonti: TuontiKoosteRivi) => tuonti.id,
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
    ];

    return (
        <div className="oph-table">
            <ReactTable
                data={data?.content}
                pages={data?.totalPages}
                columns={columns}
                sortable={false}
                previousText={translate('TAULUKKO_EDELLINEN')}
                nextText={translate('TAULUKKO_SEURAAVA')}
                noDataText={translate('TAULUKKO_EI_RIVEJA')}
                pageText={translate('TAULUKKO_SIVU')}
                ofText="/"
                rowsText={translate('TAULUKKO_RIVIA')}
                loading={loading}
                LoadingComponent={TableLoader}
                className="OppijoidenTuontiListaus table -striped"
                manual
                onFetchData={(state) => {
                    setCriteria({
                        ...criteria,
                        page: state.page + 1,
                        pageSize: state.pageSize,
                    });
                }}
            ></ReactTable>
        </div>
    );
};

export default TuontiKoosteTable;
