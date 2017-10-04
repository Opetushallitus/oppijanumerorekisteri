import React from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import R from 'ramda';
import 'react-table/react-table.css'
import './VtjVertailuListaus.css';

export default class VtjVertailuListaus extends React.Component {

    static propTypes = {
        L: PropTypes.object.isRequired,
        henkilo: PropTypes.object.isRequired,
    };

    render() {
        const henkilo = R.path(['henkilo'], this.props.henkilo);

        const henkiloData = R.pick(['etunimet', 'sukunimi', 'kutsumanimi', 'sukupuoli', 'yhteystiedotRyhma'], henkilo);
        henkiloData.palvelu = 'HENKILO_VTJ_HENKILOPALVELU';

        const yksilointitiedot = R.path(['yksilointitiedot'], this.props.henkilo);
        yksilointitiedot.palvelu = 'HENKILO_VTJ_VRKPALVELU';

        const data = [henkiloData, yksilointitiedot];

        const columns = [
            {
                Header: this.props.L['HENKILO_VTJ_TIETOLAHDE'],
                accessor: henkilo => this.renderPalvelu(henkilo),
                id: 'palvelu',
                width: 150
            },
            {
                Header: this.props.L['HENKILO_VTJ_ETUNIMET'],
                accessor: henkilo => henkilo.etunimet,
                id: 'etunimet'
            },
            {
                Header: this.props.L['HENKILO_VTJ_SUKUNIMI'],
                accessor: henkilo => henkilo.sukunimi,
                id: 'sukunimi'
            },
            {
                Header: this.props.L['HENKILO_VTJ_KUTSUMANIMI'],
                accessor: henkilo => henkilo.kutsumanimi,
                id: 'kutsumanimi'
            },
            {
                Header: this.props.L['HENKILO_VTJ_SUKUPUOLI'],
                accessor: henkilo => this.renderSukupuoli(henkilo),
                id: 'sukupuoli',
                width: 100
            },
            {
                Header: this.props.L['HENKILO_VTJ_YHTEYSTIEDOT'],
                accessor: henkilo => this.renderYhteystiedotRyhma(henkilo),
                id: 'yhteystiedot'
            },
        ];

        return <ReactTable className={['table', 'VtjVertailuListaus']}
                           columns={columns}
                           data={data}
                           sortable={false}
                           showPagination={false}
                           defaultPageSize={2}
        ></ReactTable>

    }

    renderPalvelu(henkilo) {
        return this.props.L[henkilo.palvelu];
    }

    renderSukupuoli(henkilo) {
        if(henkilo.sukupuoli === 1) {
            return this.props.L['HENKILO_VTJ_SUKUPUOLI_MIES'];
        }
        else if(henkilo.sukupuoli === 2) {
            return this.props.L['HENKILO_VTJ_SUKUPUOLI_NAINEN'];
        }
        else {
            return '';
        }
    }

    renderYhteystiedotRyhma(henkilo) {
        const yhteystiedot = henkilo.yhteystiedotRyhma ? henkilo.yhteystiedotRyhma
            .reduce( (accumulator, current) => accumulator.concat(current.yhteystieto) , [])
                .filter( yhteystieto => yhteystieto.yhteystietoArvo )
            : [];
        return <ul>
            {yhteystiedot.map( (yhteystieto, index) => <li key={index}>{this.props.L[yhteystieto.yhteystietoTyyppi]} - {yhteystieto.yhteystietoArvo}</li>)}
        </ul>
    }

}
