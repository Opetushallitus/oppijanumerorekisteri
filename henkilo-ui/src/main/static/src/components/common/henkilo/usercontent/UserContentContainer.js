// @flow
import './UserContentContainer.css';
import React from 'react';
import {connect} from 'react-redux';
import StaticUtils from "../../StaticUtils";
import type {L} from "../../../../types/localisation.type";
import {updateHenkiloAndRefetch, updateAndRefetchKayttajatieto, aktivoiHenkilo} from "../../../../actions/henkilo.actions";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import OppijaUserContent from "./OppijaUserContent";
import AdminUserContent from "./AdminUserContent";
import VirkailijaUserContent from "./VirkailijaUserContent";
import OmattiedotUserContent from "./OmattiedotUserContent";
import PalveluUserContent from "./PalveluUserContent";
import {isValidKutsumanimi} from "../../../../validation/KutsumanimiValidator";
import {LocalNotification} from "../../Notification/LocalNotification";
import {NOTIFICATIONTYPES} from "../../Notification/notificationtypes";
import type {GlobalNotificationConfig} from "../../../../types/notification.types";
import { isValidKayttajatunnus } from '../../../../validation/KayttajatunnusValidator';
import type { Kayttaja } from '../../../../types/domain/kayttooikeus/kayttaja.types'

type Props = {
    L: L,
    henkilo: {
        henkilo: Henkilo,
        kayttaja: Kayttaja,
        henkiloLoading: boolean,
        kayttajatietoLoading: boolean,
    },
    koodisto: {
        kieliKoodistoLoading: boolean,
        kansalaisuusKoodistoLoading: boolean,
        sukupuoliKoodistoLoading: boolean,
        yhteystietotyypitKoodistoLoading: boolean,
    },
    readOnly: boolean,
    basicInfo: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons: ((any) => void) => any,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
    oidHenkilo: string,
    view: string,
    aktivoiHenkilo: (oid: string) => void,
}

type State = {
    henkiloUpdate: any,
    readOnly: boolean,
    showPassive: boolean,
    isLoading: boolean,
}

class UserContentContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            henkiloUpdate: props.henkilo.henkilo ? JSON.parse(JSON.stringify(props.henkilo.henkilo)) : {},
            readOnly: true,
            showPassive: false,
            isLoading: true,
        };
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.state.isLoading) {
            const allLoaded = !nextProps.henkilo.henkiloLoading;
            if (allLoaded) {
                this.setState({
                    isLoading: false,
                    henkiloUpdate: JSON.parse(JSON.stringify(nextProps.henkilo.henkilo)), // deep copy
                });
            }
        }
    }

    render() {
        const kayttajaTyyppi = this.props.henkilo && this.props.henkilo.kayttaja && this.props.henkilo.kayttaja.kayttajaTyyppi;
        const userContentProps = {
            readOnly: this.state.readOnly,
            discardAction: this._discard.bind(this),
            updateAction: this._update.bind(this),
            updateModelAction: this._updateModelField.bind(this),
            updateDateAction: this._updateDateField.bind(this),
            henkiloUpdate: this.state.henkiloUpdate,
            edit: this._edit.bind(this),
            aktivoiHenkilo: this.props.aktivoiHenkilo,
            oidHenkilo: this.props.oidHenkilo,
            isValidForm: this._validForm()
        };
        let content;
        if (kayttajaTyyppi === 'PALVELU') {
            content = <PalveluUserContent {...userContentProps} />;
        }
        else if (this.props.view === 'OPPIJA') {
            content = <OppijaUserContent {...userContentProps} />;
        }
        else if (this.props.view === 'ADMIN') {
            content = <AdminUserContent {...userContentProps} />;
        }
        else if (this.props.view === 'VIRKAILIJA') {
            content = <VirkailijaUserContent {...userContentProps} />
        }
        else if (this.props.view === 'OMATTIEDOT') {
            content = <OmattiedotUserContent {...userContentProps} />
        }
        else {
            throw new Error('Unidentified view');
        }
        return <div className="henkiloViewUserContentWrapper">
            <div className="header">
                <p className="oph-h2 oph-bold">{this.props.L['HENKILO_PERUSTIEDOT_OTSIKKO'] + this._additionalInfo()}</p>
            </div>
            { content }

            <LocalNotification title={this.props.L['NOTIFICATION_HENKILOTIEDOT_VIRHE_OTSIKKO']}
                               type={NOTIFICATIONTYPES.WARNING}
                               toggle={!this.state.readOnly && !this._validForm()}>
                <ul>
                    {this._validKutsumanimi() ? null : <li>{this.props.L['NOTIFICATION_HENKILOTIEDOT_KUTSUMANIMI_VIRHE']}</li>}
                </ul>
                <ul>
                    {this._validKayttajatunnus() ? null : <li>{this.props.L['NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE']}</li>}
                </ul>
            </LocalNotification>
        </div>;
    }

    _edit() {
        this.setState({readOnly: false});
    }

    _additionalInfo() {
        const info = [];
        if (this.props.henkilo.kayttaja.kayttajaTyyppi === 'PALVELU') {
            info.push(this.props.L['HENKILO_ADDITIOINALINFO_PALVELU']);
        }
        else {
            if (this.props.henkilo.henkilo.yksiloity) {
                info.push(this.props.L['HENKILO_ADDITIONALINFO_YKSILOITY']);
            }
            if (this.props.henkilo.henkilo.yksiloityVTJ) {
                info.push(this.props.L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
            }
            if (!this.props.henkilo.henkilo.yksiloity && !this.props.henkilo.henkilo.yksiloityVTJ) {
                info.push(this.props.L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
            }
        }
        if (this.props.henkilo.henkilo.duplicate) {
            info.push(this.props.L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        if (this.props.henkilo.henkilo.passivoitu) {
            info.push(this.props.L['PASSIVOI_PASSIVOITU']);
        }
        return info.length ? ' (' + StaticUtils.flatArray(info) + ')' : '';
    }

    _discard() {
        this.setState({
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: true,
        });
    }

    _update() {
        const henkiloUpdate = Object.assign({}, this.state.henkiloUpdate);
        const errorUpdateHenkiloNotification: GlobalNotificationConfig = {
            autoClose: 10000,
            title: this.props.L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'],
            type: NOTIFICATIONTYPES.ERROR,
            key: 'HENKILOUPDATEFAILED'
        };
        this.props.updateHenkiloAndRefetch(henkiloUpdate, errorUpdateHenkiloNotification);
        if (henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(henkiloUpdate.oidHenkilo, henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    }

    _updateModelField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event),
        });
    }

    _updateDateField(event: any) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event)
        });
    }

    _validForm = (): boolean => {
        return this._validKutsumanimi()
            && this._validKayttajatunnus();
    };

    _validKutsumanimi = (): boolean => {
        const etunimet = this.state.henkiloUpdate.etunimet;
        const kutsumanimi = this.state.henkiloUpdate.kutsumanimi;
        return isValidKutsumanimi(etunimet, kutsumanimi);
    };

    _validKayttajatunnus = (): boolean => {
        const kayttajatunnus = this.state.henkiloUpdate.kayttajanimi
        return !kayttajatunnus || isValidKayttajatunnus(kayttajatunnus)
    }

}

const mapStateToProps = (state) => ({
    koodisto: state.koodisto,
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {updateHenkiloAndRefetch, updateAndRefetchKayttajatieto, aktivoiHenkilo})(UserContentContainer);
