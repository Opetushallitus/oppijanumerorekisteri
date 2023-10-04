import React from 'react';
import { Link } from 'react-router';
import ReactTable from 'react-table';
import '../../oph-table.css';
import moment from 'moment';
import TableLoader from '../common/icons/TableLoader';
import './OppijoidenTuontiListaus.css';
import { OppijaList } from '../../types/domain/oppijanumerorekisteri/oppijalist.types';
import SortIconNone from '../common/icons/SortIconNone';
import SortAscIcon from '../common/icons/SortAscIcon';
import SortDescIcon from '../common/icons/SortDescIcon';
import { Page } from '../../types/Page.types';
import { useLocalisations } from '../../selectors';

type Props = {
    data: Page<OppijaList>;
    onFetchData: (arg0: number, arg1: number) => void;
    onChangeSorting: (arg0: string, arg1: string) => void;
    sortKey: string;
    sortDirection: string;
    loading: boolean;
};

/**
 * Oppijoiden tuonnin listausnäkymä.
 */
const OppijoidenTuontiListaus = (props: Props) => {
    const { L } = useLocalisations();

    function renderHeader(localizationKey: string) {
        return <span className="oph-bold">{L[localizationKey]}</span>;
    }

    function renderSortIcon() {
        return props.sortDirection === 'ASC' ? <SortAscIcon /> : <SortDescIcon />;
    }

    function renderAikaleima(arvo: string) {
        return moment(arvo).format('l LT');
    }

    function renderHetuTaiSyntymaaika(henkilo: OppijaList) {
        return henkilo.syntymaaika ? moment(henkilo.syntymaaika).format('l') : null;
    }

    function renderYksilointiTilaText(arvo: string) {
        return YKSILOINTI_TILAT[arvo] ? YKSILOINTI_TILAT[arvo] : '';
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

    const columns = [
        {
            Header: renderSortableHeader('OPPIJOIDEN_TUONTI_LUONTIAIKA', 'CREATED'),
            accessor: (henkilo: OppijaList) => renderAikaleima(henkilo.luotu),
            id: 'luotu',
        },
        {
            Header: renderHeader('OPPIJOIDEN_TUONTI_KASITTELIJA'),
            accessor: (henkilo: OppijaList) =>
                henkilo.serviceUserOid ? (
                    <Link to={`virkailija/${henkilo.serviceUserOid}`}>{henkilo.serviceUserName}</Link>
                ) : null,
            id: 'kasittelija',
        },
        {
            Header: renderHeader('OPPIJOIDEN_TUONTI_OID'),
            accessor: (henkilo: OppijaList) => henkilo.oid,
            id: 'oid',
        },
        {
            Header: renderHeader('OPPIJOIDEN_TUONTI_HENKILOTUNNUS_SYNTYMAIKA'),
            accessor: renderHetuTaiSyntymaaika,
            id: 'hetu',
        },
        {
            Header: renderSortableHeader('OPPIJOIDEN_TUONTI_NIMI', 'NAME'),
            accessor: (henkilo: OppijaList) => renderOppijaLinkki(henkilo),
            id: 'nimi',
        },
        {
            Header: renderHeader('OPPIJOIDEN_TUONTI_VIRHEET'),
            accessor: (henkilo: OppijaList) => renderYksilointiTilaText(henkilo.yksilointiTila),
            id: 'virheet',
        },
    ];
    return (
        <div className="oph-table">
            <ReactTable
                data={props.data.results}
                pages={props.data.totalPages}
                columns={columns}
                sortable={false}
                previousText={L['TAULUKKO_EDELLINEN']}
                nextText={L['TAULUKKO_SEURAAVA']}
                noDataText={L['TAULUKKO_EI_RIVEJA']}
                pageText={L['TAULUKKO_SIVU']}
                ofText="/"
                rowsText={L['TAULUKKO_RIVIA']}
                loading={props.loading}
                LoadingComponent={TableLoader}
                className="OppijoidenTuontiListaus table -striped"
                manual
                onFetchData={(state) => {
                    props.onFetchData(state.page + 1, state.pageSize);
                }}
            ></ReactTable>
        </div>
    );

    function renderSortableHeader(localizationKey: string, headerKey: string) {
        const newSortDirection = props.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        return (
            <button
                style={{ display: 'block' }}
                onClick={() => props.onChangeSorting(headerKey, newSortDirection)}
                className="reset-button-styles oph-bold sortable-header"
            >
                {L[localizationKey]} {props.sortKey === headerKey ? renderSortIcon() : <SortIconNone></SortIconNone>}
            </button>
        );
    }
};

export default OppijoidenTuontiListaus;
