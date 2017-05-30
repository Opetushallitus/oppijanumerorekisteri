import React from 'react';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';

export default class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        henkilo: React.PropTypes.object,

    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return <div className="duplicates-view">
            <div id="duplicates">
                <div className="person header">
                    <span>header1</span>

                </div>
                <div className="person master">
                    <span className="type">Master</span>
                    <span>Master</span>

                </div>
                <div className="person">
                    <span className="type">Slave</span>
                    <span>slave</span>
                </div>


            </div>
            <Button>{L['DUPLIKAATIT_YHDISTA']}</Button>
        </div>
    }

    _getRows(slaves) {
        const keys = ['henkilotunnus', 'yksiloity', 'kutsumanimi', 'etunimet', 'sukunimi', 'syntymaaika', 'oidHenkilo', 'kansalaisuus', 'aidinkieli', 'matkapuhelinnumero', 'sahkopostiosoite', 'osoite',
            'postinumero', 'kansallinenId', 'hakemuksenTila', 'hakemuksenOid', 'muutHakemukset'];
        const L = this.props.l10n[this.props.locale];
        return keys.map(key => {
            return <tr key={key}>
                <td>{L[`DUPLIKAATIT_${key.toUpperCase()}`] || key}</td>
                { this._getRow(key, slaves) }
            </tr>
        });
    }

    _getRow(key, slaves) {
        return slaves.map((slave, index) => <td key={slave.id}>{slave[key]}</td>)
    }


}

/*<table id="duplikaatit">
 <thead>
 <tr>
 <th></th>
 <th>{L['DUPLIKAATIT_HENKILON_TIEDOT']}</th>
 {this.props.henkilo.slaves.map( slave =>  <th key={slave.id}><p className="oph-bold">{L['DUPLIKAATIT_DUPLIKAATTI']}</p></th>)}
 </tr>
 </thead>
 <tbody>
 {this._getRows(this.props.henkilo.slaves)}
 </tbody>

 </table>*/