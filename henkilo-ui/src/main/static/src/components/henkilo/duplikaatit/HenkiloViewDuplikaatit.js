import React from 'react';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';

export default class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        henkilo: React.PropTypes.object
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        const master = this.props.henkilo.henkilo;
        const duplicates = this.props.henkilo.duplicates;
        return <div className="duplicates-view">
            <div id="duplicates">
                <div className="person header">
                    <span></span>
                    <span>{L['DUPLIKAATIT_HENKILOTUNNUS']}</span>
                    <span>{L['DUPLIKAATIT_YKSILOITY']}</span>
                    <span>{L['DUPLIKAATIT_KUTSUMANIMI']}</span>
                    <span>{L['DUPLIKAATIT_ETUNIMET']}</span>
                    <span>{L['DUPLIKAATIT_SUKUNIMI']}</span>
                    <span>{L['DUPLIKAATIT_SUKUPUOLI']}</span>
                    <span>{L['DUPLIKAATIT_SYNTYMAAIKA']}</span>
                    <span>{L['DUPLIKAATIT_OIDHENKILO']}</span>
                    <span>{L['DUPLIKAATIT_KANSALAISUUS']}</span>
                    <span>{L['DUPLIKAATIT_AIDINKIELI']}</span>
                    <span>{L['DUPLIKAATIT_MATKAPUHELINNUMERO']}</span>
                    <span>{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                    <span>{L['DUPLIKAATIT_OSOITE']}</span>
                    <span>{L['DUPLIKAATIT_POSTINUMERO']}</span>
                    <span>{L['DUPLIKAATIT_PASSINUMERO']}</span>
                    <span>{L['DUPLIKAATIT_KANSALLINENID']}</span>
                    <span>{L['DUPLIKAATIT_HAKEMUKSENTILA']}</span>
                    <span>{L['DUPLIKAATIT_HAKEMUKSENOID']}</span>
                    <span>{L['DUPLIKAATIT_MUUTHAKEMUKSET']}</span>
                </div>
                <div className="person master">
                    <span className="type">{L['DUPLIKAATIT_HENKILON_TIEDOT']}</span>
                    <span>{master.hetu}</span>
                    <span>{master.yksiloity}</span>
                    <span>{master.kutsumanimi}</span>
                    <span>{master.etunimet}</span>
                    <span>{master.sukunimi}</span>
                    <span>{master.sukupuoli}</span>
                    <span>{master.syntymaaika}</span>
                    <span>{master.oidHenkilo}</span>
                    <span>{master.kansalaisuus}</span>
                    <span>{master.aidinkieli}</span>
                    <span>{master.matkapuhelinnumero}</span>
                    <span>{master.sahkopostiosoite}</span>
                    <span>{master.osoite}</span>
                    <span>{master.postinumero}</span>
                    <span>{master.passinnumero}</span>
                    <span>{master.kansallinenId}</span>
                    <span>{master.hakemuksentila}</span>
                    <span>{master.oidHakemus}</span>
                    <span>{master.muutHakemukset}</span>
                    <span><input type="checkbox" disabled={true} checked={true}/></span>
                </div>
                {duplicates.map( (duplicates) => <div className="person">
                    <span className="type">{L['DUPLIKAATIT_DUPLIKAATTI']}</span>
                    <span>{duplicates.hetu}</span>
                    <span>{duplicates.yksiloity}</span>
                    <span>{duplicates.kutsumanimi}</span>
                    <span>{duplicates.etunimet}</span>
                    <span>{duplicates.sukunimi}</span>
                    <span>{duplicates.sukupuoli}</span>
                    <span>{duplicates.syntymaaika}</span>
                    <span>{duplicates.oidHenkilo}</span>
                    <span>{duplicates.kansalaisuus}</span>
                    <span>{duplicates.aidinkieli}</span>
                    <span>{duplicates.matkapuhelinnumero}</span>
                    <span>{duplicates.sahkopostiosoite}</span>
                    <span>{duplicates.osoite}</span>
                    <span>{duplicates.postinumero}</span>
                    <span>{duplicates.passinnumero}</span>
                    <span>{duplicates.kansallinenId}</span>
                    <span>{duplicates.hakemuksentila}</span>
                    <span>{duplicates.oidHakemus}</span>
                    <span>{duplicates.muutHakemukset}</span>
                    <span><input type="checkbox" /></span>
                </div>)}

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