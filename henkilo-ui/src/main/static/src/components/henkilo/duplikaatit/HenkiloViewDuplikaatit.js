import React from 'react';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import R from 'ramda';
import DuplikaattiColumn from './DuplikaattiColumn';

export default class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        oidHenkilo: React.PropTypes.string,
        henkilo: React.PropTypes.object,
        omattiedot: React.PropTypes.object,
        l10n: React.PropTypes.object,
        locale: React.PropTypes.string,
        koodisto: React.PropTypes.object
    };

    constructor() {
        super();
        this.state = {
            selectedDuplicates: []
        }
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        const master = this.props.henkilo.henkilo;
        const duplicates = this.props.henkilo.duplicates;
        const koodisto = this.props.koodisto;
        const locale = this.props.locale;
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
                    <span>{master.yksiloity || master.yksiloityVTJ ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}</span>
                    <span>{master.kutsumanimi}</span>
                    <span>{master.etunimet}</span>
                    <span>{master.sukunimi}</span>
                    <span>{master.sukupuoli === '2' ? L['HENKILO_YHTEISET_NAINEN'] : L['HENKILO_YHTEISET_MIES']}</span>
                    <span>{master.syntymaaika}</span>
                    <span>{master.oidHenkilo}</span>
                    <span>{master.kansalaisuus}</span>
                    <span>{master.asiointiKieli ? master.asiointiKieli.kieliTyyppi : ''}</span>
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
                { duplicates.map((duplicate) => 
                    <DuplikaattiColumn
                        henkilo={duplicate}
                        koodisto={koodisto}
                        L={L}
                        locale={locale}
                        key={duplicate.oidHenkilo}
                        classNames={{'person': true}}
                        setSelection={this.setSelection.bind(this)}>
                    </DuplikaattiColumn>
                )}

            </div>
            <Button disabled={this.state.selectedDuplicates.length === 0}
                    action={this._link.bind(this)}>{L['DUPLIKAATIT_YHDISTA']}</Button>
        </div>
    }

    async _link() {
        await this.props.linkHenkilos(this.props.oidHenkilo, this.state.selectedDuplicates);
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
    }

    setSelection(oid) {
        const selectedDuplicates = R.contains(oid, this.state.selectedDuplicates) ?
            R.reject(duplicateOid => duplicateOid === oid, this.state.selectedDuplicates) :
            R.append(oid, this.state.selectedDuplicates);
        this.setState({selectedDuplicates});
    }


}

