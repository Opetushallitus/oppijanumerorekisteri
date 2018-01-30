// @flow
import React from 'react';
import {connect} from 'react-redux';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import * as R from 'ramda';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from "../../common/icons/Loader";
import type {Notification} from '../../common/notifications/Notifications'
import {FloatingBar} from "./FloatingBar";
import {enabledDuplikaattiView} from "../../navigation/NavigationTabs";
import type {Locale} from '../../../types/locale.type'
import type {L} from '../../../types/localisation.type'
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {KoodistoState} from "../../../reducers/koodisto.reducer";
import {LocalNotification} from "../../common/Notification/LocalNotification";
import {NOTIFICATIONTYPES} from "../../common/Notification/notificationtypes";
import { linkHenkilos } from "../../../actions/henkilo.actions";

type Props = {
    router: any,
    locale: Locale,
    L: L,
    oidHenkilo: string,
    henkilo: HenkiloState,
    henkiloType: string,
    koodisto: KoodistoState,
    notifications: Array<Notification>,
    removeNotification: (string, string, ?string) => void,
    linkHenkilos: (masterOid: string, slaveOids: Array<string>, successMessage: string, failMessage: string) => void,
    fetchHenkilo: (oid: string) => void,
    fetchHenkiloDuplicates: (oid: string) => void,
    ownOid: string,
    vainLuku?: boolean,
}

type State = {
    selectedDuplicates: Array<string>,
    notifications: Array<Notification>,
    yksiloitySelected: boolean,
}

class HenkiloViewDuplikaatit extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            selectedDuplicates: [],
            yksiloitySelected: this.props.henkilo.henkilo.yksiloity || this.props.henkilo.henkilo.yksiloityVTJ,
        }
    }

    render() {
        const master = this.props.henkilo.henkilo;
        master.hakemukset = this.props.henkilo.hakemukset;
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
                    vainLuku={this.props.vainLuku}
                    henkiloType={this.props.henkiloType}
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
                        vainLuku={this.props.vainLuku}
                        henkiloType={this.props.henkiloType}
                        setSelection={this.setSelection.bind(this)}
                        yksiloitySelected={this.state.yksiloitySelected}>
                    </DuplikaatitPerson>
                )}
                {this.props.henkilo.duplicatesLoading ? <Loader/> : null}
                <LocalNotification title={this.props.L['DUPLIKAATIT_NOTIFICATION_EI_LOYTYNYT']} type={NOTIFICATIONTYPES.INFO} toggle={!this.props.henkilo.duplicates}></LocalNotification>

            </div>
            {!this.props.vainLuku &&
            <FloatingBar>
                <Button disabled={this.state.selectedDuplicates.length === 0 || !enabledDuplikaattiView(this.props.oidHenkilo, this.props.henkilo.masterLoading, this.props.henkilo.master.oidHenkilo) || (this.props.oidHenkilo === this.props.ownOid)}
                        action={this._link.bind(this)}>{this.props.L['DUPLIKAATIT_YHDISTA']}</Button>
            </FloatingBar>
            }
        </div>
    }

    async _link() {
        const successMessage = this.props.L['DUPLIKAATIT_NOTIFICATION_ONNISTUI'];
        const failMessage = this.props.L['DUPLIKAATIT_NOTIFICATION_EPAONNISTUI'];
        await this.props.linkHenkilos(this.props.oidHenkilo, this.state.selectedDuplicates, successMessage, failMessage);
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.router.push(`/${this.props.henkiloType}/${this.props.oidHenkilo}`);
    }

    setSelection(oid) {
        const selectedDuplicates = R.contains(oid, this.state.selectedDuplicates) ?
            R.reject(duplicateOid => duplicateOid === oid, this.state.selectedDuplicates) :
            R.append(oid, this.state.selectedDuplicates);
        this.setState({selectedDuplicates});
    }

}

const mapStateToProps = (state) => ({
    ownOid: state.omattiedot.data.oid,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    koodisto: state.koodisto
});

export default connect(mapStateToProps, {linkHenkilos})(HenkiloViewDuplikaatit);
