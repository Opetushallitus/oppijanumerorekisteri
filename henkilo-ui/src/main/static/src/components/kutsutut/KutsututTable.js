import React from 'react';
import dateformat from 'dateformat';
import './KutsututTable.css';
import Table from '../common/table/Table';
import Button from '../common/button/Button';

export default class KutsututTable extends React.Component {

    static propTypes = {
        fetchKutsus: React.PropTypes.func,
        L: React.PropTypes.object,
        kutsus: React.PropTypes.array,
        cancelInvitation: React.PropTypes.func,
        locale: React.PropTypes.string
    };

    constructor() {
        super();
        this.state = {
            sortBy: 'AIKALEIMA',
            direction: 'DESC'
        }
    }

    render() {
        const L = this.props.L;
        const headings = [{ key: 'KUTSUT_NIMI_OTSIKKO', label: L['KUTSUT_NIMI_OTSIKKO'] },
            { key: 'KUTSUT_SAHKOPOSTI_OTSIKKO', label: L['KUTSUT_SAHKOPOSTI_OTSIKKO'] },
            { key: 'KUTSUTUT_ORGANISAATIO_OTSIKKO', label: L['KUTSUTUT_ORGANISAATIO_OTSIKKO'] },
            { key: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', label: L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO'] },
            { key: 'KUTSU_PERUUTA', label: ''}
        ];
        
        const data = this.props.kutsus.map( kutsu => ({
            KUTSUT_NIMI_OTSIKKO: this.createNimiCell(kutsu),
            KUTSUT_SAHKOPOSTI_OTSIKKO: this.createSahkopostiCell(kutsu),
            KUTSUTUT_ORGANISAATIO_OTSIKKO: this.createOrganisaatiotCell(kutsu),
            KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO: this.createKutsuLahetettyCell(kutsu),
            KUTSU_PERUUTA: this.createPeruutaCell(kutsu)
        }));
        
        return (<Table headings={headings} data={data}></Table>);
    }

    createNimiCell(kutsu) {
        return `${kutsu.etunimi} ${kutsu.sukunimi}`;
    }

    createSahkopostiCell(kutsu) {
        return kutsu.sahkoposti;
    }

    createOrganisaatiotCell(kutsu) {
        return (<div>
                { kutsu.organisaatiot.map(org => <div key={org.oid}>{org.nimi[this.props.locale]}</div>)}
                </div>);
    }

    createKutsuLahetettyCell(kutsu) {
        return dateformat(new Date(kutsu.aikaleima), this.props.L['PVM_FORMAATTI']);
    }

    createPeruutaCell(kutsu) {
        return kutsu.tila === 'AVOIN' &&
            <Button className="cancel" action={this.props.cancelInvitation(kutsu)}>{this.props.L['PERUUTA_KUTSU']}</Button>
    }

}

