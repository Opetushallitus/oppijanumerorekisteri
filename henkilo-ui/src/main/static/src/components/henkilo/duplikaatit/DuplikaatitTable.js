// @flow
import React from 'react'
import {Link} from 'react-router'
import ReactTable from 'react-table'
import moment from 'moment'
import type {L} from "../../../types/localisation.type";

type Props = {
    L: L,
    data: Array<any>,
    lisaaOppijaKayttajanOrganisaatioihin: (henkiloOid: string) => Promise<*>,
}

/**
 * Näyttää duplikaatit taulukkonäkymässä.
 */
class DuplikaatitTable extends React.Component<Props> {

    render() {
        const columns = [
            {
                Header: 'Oppijanumero',
                accessor: 'oidHenkilo',
                Cell: row => (
                    <Link to={'oppija/' + row.value} target="_blank">{row.value}</Link>
                ),
            },
            {
                Header: 'Etunimet',
                accessor: 'etunimet',
            },
            {
                Header: 'Kutsumanimi',
                accessor: 'kutsumanimi',
            },
            {
                Header: 'Sukunimi',
                accessor: 'sukunimi',
            },
            {
                Header: 'Hetu',
                accessor: 'hetu',
            },
            {
                Header: 'Syntymäaika',
                accessor: henkilo => henkilo.syntymaaika ? moment(henkilo.syntymaaika).format() : null,
                id: 'syntymaaika',
            },
            {
                Header: '',
                accessor: 'oidHenkilo',
                Cell: row => (
                    <button type="button" className="oph-button oph-button-primary" onClick={(e) => {e.preventDefault(); this.props.lisaaOppijaKayttajanOrganisaatioihin(row.value)}}>
                        {this.props.L['OPPIJA_LISAA_KAYTTAJAN_ORGANISAATIOIHIN']}
                    </button>
                ),
            },
        ]
        return (
            <ReactTable
                data={this.props.data}
                columns={columns}
                previousText={this.props.L['TAULUKKO_EDELLINEN']}
                nextText={this.props.L['TAULUKKO_SEURAAVA']}
                noDataText={this.props.L['TAULUKKO_EI_RIVEJA']}
                pageText={this.props.L['TAULUKKO_SIVU']}
                ofText="/"
                rowsText={this.props.L['TAULUKKO_RIVIA']}
                />
        )
    }

}

export default DuplikaatitTable
