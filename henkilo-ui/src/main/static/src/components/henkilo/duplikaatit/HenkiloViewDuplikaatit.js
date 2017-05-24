import React from 'react';
import './HenkiloViewDuplikaatit.css';

export default class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        henkilo: React.PropTypes.object,

    };

    render() {
        
        const L = this.props.l10n[this.props.locale];
        return <table id="duplikaatit">
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

        </table>
    }

    _getRows(slaves) {
        const keys = ['henkilotunnus', 'yksiloity', 'kutsumanimi', 'etunimet', 'sukunimi', 'syntymaaika', 'oidHenkilo', 'kansalaisuus', 'aidinkieli', 'matkapuhelinnumero', 'sahkopostiosoite', 'osoite',
            'postinumero', 'kansallinenId', 'hakemuksenTila', 'hakemuksenOid', 'muutHakemukset'];
        const L = this.props.l10n[this.props.locale];
        return keys.map( key => {
            return <tr key={key}>
                <td>{L[`DUPLIKAATIT_${key.toUpperCase()}`] || key}</td>
                { this._getRow(key, slaves) }
            </tr>
        });
    }

    _getRow(key, slaves) {
        return slaves.map( (slave, index) => <td key={slave.id}>{slave[key]}</td> )
    }


}