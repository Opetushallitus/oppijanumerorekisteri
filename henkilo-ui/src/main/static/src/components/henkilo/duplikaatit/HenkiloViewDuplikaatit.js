import React from 'react';
import PropTypes from 'prop-types'
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import R from 'ramda';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from "../../common/icons/Loader";
import PropertySingleton from '../../../globals/PropertySingleton'
import Notifications from "../../common/notifications/Notifications";
import {FloatingBar} from "./FloatingBar";

export default class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        oidHenkilo: PropTypes.string,
        henkilo: PropTypes.object,
        omattiedot: PropTypes.object,
        l10n: PropTypes.object,
        locale: PropTypes.string,
        koodisto: PropTypes.object,
        notifications: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedDuplicates: [],
            notifications: [],
            yksiloitySelected: this.props.henkilo.henkilo.yksiloity || this.props.henkilo.henkilo.yksiloityVTJ,
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
                    <span/>
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
                <DuplikaatitPerson
                    henkilo={master}
                    koodisto={koodisto}
                    L={L}
                    header={'DUPLIKAATIT_HENKILON_TIEDOT'}
                    locale={locale}
                    classNames={{'person': true, master: true}}
                    isMaster={true}
                    setSelection={this.setSelection.bind(this)}/>
                {duplicates.map((duplicate) =>
                    <DuplikaatitPerson
                        henkilo={duplicate}
                        koodisto={koodisto}
                        L={L}
                        header={'DUPLIKAATIT_DUPLIKAATTI'}
                        locale={locale}
                        key={duplicate.oidHenkilo}
                        isMaster={false}
                        classNames={{'person': true}}
                        setSelection={this.setSelection.bind(this)}
                        yksiloitySelected={this.state.yksiloitySelected}>
                    </DuplikaatitPerson>
                )}
                {this.props.henkilo.duplicatesLoading ? <Loader/> : null}
                <Notifications L={L}
                               notifications={this.props.notifications}
                               closeAction={(status, id) => this.props.removeNotification(status, 'duplicatesNotifications', id)}/>

            </div>
            <FloatingBar>
                <Button disabled={this.state.selectedDuplicates.length === 0}
                        action={this._link.bind(this)}>{L['DUPLIKAATIT_YHDISTA']}</Button>
            </FloatingBar>
        </div>
    }

    async _link() {
        const notificationId = PropertySingleton.getNewId();
        this.setState({notifications: [...this.state.notifications, notificationId,]});
        await this.props.linkHenkilos(this.props.oidHenkilo, this.state.selectedDuplicates, notificationId);
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

