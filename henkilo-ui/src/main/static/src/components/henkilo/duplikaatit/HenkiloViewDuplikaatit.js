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
                <DuplikaattiColumn
                    henkilo={master}
                    koodisto={koodisto}
                    L={L}
                    header={'DUPLIKAATIT_HENKILON_TIEDOT'}
                    locale={locale}
                    classNames={{'person': true, master: true}}
                    isDisabled={true}
                    setSelection={this.setSelection.bind(this)}>
                </DuplikaattiColumn>
                { duplicates.map((duplicate) =>
                    <DuplikaattiColumn
                        henkilo={duplicate}
                        koodisto={koodisto}
                        L={L}
                        header={'DUPLIKAATIT_DUPLIKAATTI'}
                        locale={locale}
                        key={duplicate.oidHenkilo}
                        isDisabled={false}
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

