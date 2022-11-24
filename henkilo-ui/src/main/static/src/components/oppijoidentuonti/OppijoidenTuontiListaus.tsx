import React from 'react';
import { Link } from 'react-router';
import ReactTable from 'react-table';
import '../../oph-table.css';
import moment from 'moment';
import TableLoader from '../common/icons/TableLoader';
import './OppijoidenTuontiListaus.css';
import { TuontiListausState } from '../../reducers/oppijoidentuonti.reducer';
import { OppijaList } from '../../types/domain/oppijanumerorekisteri/oppijalist.types';
import SortIconNone from '../common/icons/SortIconNone';
import SortAscIcon from '../common/icons/SortAscIcon';
import SortDescIcon from '../common/icons/SortDescIcon';

type Props = {
    translate: (key: string) => string;
    state: TuontiListausState;
    onFetchData: (arg0: number, arg1: number) => void;
    onChangeSorting: (arg0: string, arg1: string) => void;
    sortKey: string;
    sortDirection: string;
    loading: boolean;
};

/**
 * Oppijoiden tuonnin listausnäkymä.
 */
class OppijoidenTuontiListaus extends React.Component<Props> {
    render() {
        const columns = [
            {
                Header: this.renderSortableHeader('OPPIJOIDEN_TUONTI_LUONTIAIKA', 'CREATED'),
                accessor: (henkilo: OppijaList) => this.renderAikaleima(henkilo.luotu),
                id: 'luotu',
            },
            {
                Header: this.renderHeader('OPPIJOIDEN_TUONTI_KASITTELIJA'),
                accessor: (henkilo: OppijaList) =>
                    henkilo.serviceUserOid ? (
                        <Link to={`virkailija/${henkilo.serviceUserOid}`}>{henkilo.serviceUserName}</Link>
                    ) : null,
                id: 'kasittelija',
            },
            {
                Header: this.renderHeader('OPPIJOIDEN_TUONTI_OID'),
                accessor: (henkilo: OppijaList) => henkilo.oid,
                id: 'oid',
            },
            {
                Header: this.renderHeader('OPPIJOIDEN_TUONTI_HENKILOTUNNUS_SYNTYMAIKA'),
                accessor: this.renderHetuTaiSyntymaaika,
                id: 'hetu',
            },
            {
                Header: this.renderSortableHeader('OPPIJOIDEN_TUONTI_NIMI', 'NAME'),
                accessor: (henkilo: OppijaList) => this.renderOppijaLinkki(henkilo),
                id: 'nimi',
            },
            {
                Header: this.renderHeader('OPPIJOIDEN_TUONTI_VIRHEET'),
                accessor: (henkilo: OppijaList) => this.renderYksilointiTilaText(henkilo.yksilointiTila),
                id: 'virheet',
            },
        ];
        return (
            <div className="oph-table">
                <ReactTable
                    data={this.props.state.data.results}
                    pages={this.props.state.data.totalPages}
                    columns={columns}
                    sortable={false}
                    previousText={this.props.translate('TAULUKKO_EDELLINEN')}
                    nextText={this.props.translate('TAULUKKO_SEURAAVA')}
                    noDataText={this.props.translate('TAULUKKO_EI_RIVEJA')}
                    pageText={this.props.translate('TAULUKKO_SIVU')}
                    ofText="/"
                    rowsText={this.props.translate('TAULUKKO_RIVIA')}
                    loading={this.props.loading}
                    LoadingComponent={TableLoader}
                    className="OppijoidenTuontiListaus table -striped"
                    manual
                    onFetchData={(state) => {
                        this.props.onFetchData(state.page + 1, state.pageSize);
                    }}
                ></ReactTable>
            </div>
        );
    }

    renderSortableHeader(localizationKey: string, headerKey: string) {
        const newSortDirection = this.props.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        return (
            <span
                style={{ display: 'block' }}
                onClick={() => this.props.onChangeSorting(headerKey, newSortDirection)}
                className="oph-bold sortable-header"
            >
                {this.props.translate(localizationKey)}{' '}
                {this.props.sortKey === headerKey ? this.renderSortIcon() : <SortIconNone></SortIconNone>}
            </span>
        );
    }

    renderHeader(localizationKey: string) {
        return <span className="oph-bold">{this.props.translate(localizationKey)}</span>;
    }

    renderSortIcon() {
        return this.props.sortDirection === 'ASC' ? <SortAscIcon /> : <SortDescIcon />;
    }

    renderAikaleima(arvo: string) {
        return moment(arvo).format('l LT');
    }

    renderHetuTaiSyntymaaika(henkilo: OppijaList) {
        return henkilo.syntymaaika ? moment(henkilo.syntymaaika).format('l') : null;
    }

    renderYksilointiTilaText(arvo: string) {
        return YKSILOINTI_TILAT[arvo] ? YKSILOINTI_TILAT[arvo](this.props.translate) : '';
    }

    renderOppijaLinkki(henkilo: OppijaList) {
        const linkki = `oppija/${henkilo.oid}`;
        const nimi = `${henkilo.sukunimi}, ${henkilo.etunimet}`;
        return <Link to={linkki}>{nimi}</Link>;
    }
}

const YKSILOINTI_TILAT = {
    OK: () => '',
    VIRHE: (translate: (key: string) => string) => translate('YKSILOINTI_TILA_VIRHE'),
    KESKEN: (translate: (key: string) => string) => translate('YKSILOINTI_TILA_KESKEN'),
    HETU_PUUTTUU: (translate: (key: string) => string) => translate('YKSILOINTI_TILA_HETU_PUUTTUU'),
};

export default OppijoidenTuontiListaus;
