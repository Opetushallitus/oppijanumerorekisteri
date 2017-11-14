import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import * as R from 'ramda';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from "../../common/icons/Loader";
import PropertySingleton from '../../../globals/PropertySingleton'
import Notifications from "../../common/notifications/Notifications";
import {FloatingBar} from "./FloatingBar";
import {enabledDuplikaattiView} from "../../navigation/NavigationTabs";

class HenkiloViewDuplikaatit extends React.Component {

    static propTypes = {
        oidHenkilo: PropTypes.string,
        henkilo: PropTypes.object,
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
        const master = this.props.henkilo.henkilo;
        const duplicates = this.props.henkilo.duplicates;
        const koodisto = this.props.koodisto;
        const locale = this.props.locale;
        return <div className="duplicates-view">
            <div id="duplicates">
                <div className="person header">
                    <span/>
                    <span>{this.props.L['DUPLIKAATIT_HENKILOTUNNUS']}</span>
                    <span>{this.props.L['DUPLIKAATIT_YKSILOITY']}</span>
                    <span>{this.props.L['DUPLIKAATIT_KUTSUMANIMI']}</span>
                    <span>{this.props.L['DUPLIKAATIT_ETUNIMET']}</span>
                    <span>{this.props.L['DUPLIKAATIT_SUKUNIMI']}</span>
                    <span>{this.props.L['DUPLIKAATIT_SUKUPUOLI']}</span>
                    <span>{this.props.L['DUPLIKAATIT_SYNTYMAAIKA']}</span>
                    <span>{this.props.L['DUPLIKAATIT_OIDHENKILO']}</span>
                    <span>{this.props.L['DUPLIKAATIT_KANSALAISUUS']}</span>
                    <span>{this.props.L['DUPLIKAATIT_AIDINKIELI']}</span>
                    <span>{this.props.L['DUPLIKAATIT_MATKAPUHELINNUMERO']}</span>
                    <span>{this.props.L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                    <span>{this.props.L['DUPLIKAATIT_OSOITE']}</span>
                    <span>{this.props.L['DUPLIKAATIT_POSTINUMERO']}</span>
                    <span>{this.props.L['DUPLIKAATIT_PASSINUMERO']}</span>
                    <span>{this.props.L['DUPLIKAATIT_KANSALLINENID']}</span>
                    <span>{this.props.L['DUPLIKAATIT_HAKEMUKSENTILA']}</span>
                    <span>{this.props.L['DUPLIKAATIT_HAKEMUKSENOID']}</span>
                    <span>{this.props.L['DUPLIKAATIT_MUUTHAKEMUKSET']}</span>
                </div>
                <DuplikaatitPerson
                    henkilo={master}
                    koodisto={koodisto}
                    L={this.props.L}
                    header={'DUPLIKAATIT_HENKILON_TIEDOT'}
                    locale={locale}
                    classNames={{'person': true, master: true}}
                    isMaster={true}
                    setSelection={this.setSelection.bind(this)}/>
                {duplicates.map((duplicate) =>
                    <DuplikaatitPerson
                        henkilo={duplicate}
                        koodisto={koodisto}
                        L={this.props.L}
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
                <Notifications L={this.props.L}
                               notifications={this.props.notifications}
                               closeAction={(status, id) => this.props.removeNotification(status, 'duplicatesNotifications', id)}/>

            </div>
            <FloatingBar>
                <Button disabled={this.state.selectedDuplicates.length === 0 || !enabledDuplikaattiView(this.props.oidHenkilo, this.props.henkilo.masterLoading, this.props.henkilo.master.oidHenkilo) || (this.props.oidHenkilo === this.props.ownOid)}
                        action={this._link.bind(this)}>{this.props.L['DUPLIKAATIT_YHDISTA']}</Button>
            </FloatingBar>
        </div>
    }

    async _link() {
        const notificationId = PropertySingleton.getNewId();
        this.setState({notifications: [...this.state.notifications, notificationId,]});
        await this.props.linkHenkilos(this.props.oidHenkilo, this.state.selectedDuplicates, notificationId);
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.router.push(`/virkailija/${this.props.oidHenkilo}`);
    }

    setSelection(oid) {
        const selectedDuplicates = R.contains(oid, this.state.selectedDuplicates) ?
            R.reject(duplicateOid => duplicateOid === oid, this.state.selectedDuplicates) :
            R.append(oid, this.state.selectedDuplicates);
        this.setState({selectedDuplicates});
    }

}

const mapStateToProps = (state, ownProps) => ({
    ownOid: state.omattiedot.data.oid,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
});

export default connect(mapStateToProps, {})(HenkiloViewDuplikaatit);
