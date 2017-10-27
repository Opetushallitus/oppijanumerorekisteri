// @flow
import React from 'react'
import ReactTable from 'react-table'
import moment from 'moment'

type Props = {
    L: any,
    data: Array<any>,
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
