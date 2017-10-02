import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import ReactTable from 'react-table'
import moment from 'moment'
import TableLoader from '../common/icons/TableLoader'
import YksilointiTilaIkoni from './YksilointiTilaIkoni'
import './OppijoidenTuontiListaus.css';

/**
 * Oppijoiden tuonnin listausnäkymä.
 */
class OppijoidenTuontiListaus extends React.Component {

    render() {
        const columns = [
            {
                Header: this.props.L['OPPIJOIDEN_TUONTI_YKSILOINTI_TILA'],
                accessor: henkilo => this.renderYksilointiTilaIcon(henkilo.yksilointiTila),
                id: 'tila',
                className: 'yksilointi-tila-sarake'
            },
            {
                Header: this.props.L['OPPIJOIDEN_TUONTI_AIKA'],
                accessor: henkilo => this.renderAikaleima(henkilo.luotu),
                id: 'luotu'
            },
            {
                Header: this.props.L['OPPIJOIDEN_TUONTI_HENKILOTUNNUS_SYNTYMAIKA'],
                accessor: this.renderHetuTaiSyntymaaika,
                id: 'hetu'
            },
            {
                Header: this.props.L['OPPIJOIDEN_TUONTI_NIMI'],
                accessor: henkilo => this.renderOppijaLinkki(henkilo),
                id: 'nimi'
            },
            {
                Header: this.props.L['OPPIJOIDEN_TUONTI_VIRHEET'],
                accessor: henkilo => this.renderYksilointiTilaText(henkilo.yksilointiTila),
                id: 'virheet'},
        ];
        return (
            <ReactTable data={this.props.state.data.results}
                        pages={this.props.state.data.totalPages}
                        columns={columns}
                        sortable={false}
                        previousText={this.props.L['TAULUKKO_EDELLINEN']}
                        nextText={this.props.L['TAULUKKO_SEURAAVA']}
                        noDataText={this.props.L['TAULUKKO_EI_RIVEJA']}
                        pageText={this.props.L['TAULUKKO_SIVU']}
                        ofText="/"
                        rowsText={this.props.L['TAULUKKO_RIVIA']}
                        loading={this.props.state.loading}
                        LoadingComponent={TableLoader}
                        className="OppijoidenTuontiListaus"
                        manual
                        onFetchData={(state) => {
                            this.props.onFetchData(state.page + 1, state.pageSize);
                        }}>
            </ReactTable>
        );
    }

    renderYksilointiTilaIcon(arvo) {
        return <YksilointiTilaIkoni value={arvo}></YksilointiTilaIkoni>;
    }

    renderAikaleima(arvo) {
        return moment(arvo).format('l LT');
    }

    renderHetuTaiSyntymaaika(henkilo) {
        return henkilo.hetu || (henkilo.syntymaaika ? moment(henkilo.syntymaaika).format('l') : null);
    }

    renderYksilointiTilaText(arvo) {
        return YKSILOINTI_TILAT[arvo] ? YKSILOINTI_TILAT[arvo](this.props.L) : '';
    }

    renderOppijaLinkki(henkilo) {
        const linkki = `oppija/${henkilo.oid}`;
        const nimi = [henkilo.etunimet, henkilo.sukunimi].join(' ');
        return <Link to={linkki}>{nimi}</Link>;
    }

};

OppijoidenTuontiListaus.propTypes = {
    state: PropTypes.object.isRequired,
    onFetchData: PropTypes.func.isRequired,
    L: PropTypes.object.isRequired,
};

const YKSILOINTI_TILAT = {
    OK: L => '',
    VIRHE: L => L['YKSILOINTI_TILA_VIRHE'],
    KESKEN: L => L['YKSILOINTI_TILA_KESKEN'],
    HETU_PUUTTUU: L => L['YKSILOINTI_TILA_HETU_PUUTTUU'],
};

export default OppijoidenTuontiListaus;
