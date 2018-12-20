// @flow
import React from "react";
import * as R from "ramda";
import Modal from "../common/modal/Modal";
import Button from "../common/button/Button";
import {toLocalizedText} from '../../localizabletext';
import './KutsuConfirmation.css';
import {http} from '../../http';
import {urls} from 'oph-urls-js';
import type {
    KutsuOrganisaatio
} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type { L10n, Localisations } from "../../types/localisation.type";
import type { MyonnettyKayttooikeusryhma } from "../../types/domain/kayttooikeus/kayttooikeusryhma.types"
import { LocalNotification } from "../common/Notification/LocalNotification";
import type {KutsuBasicInfo} from "../../types/KutsuBasicInfo.types";

type Props = {
    addedOrgs: Array<KutsuOrganisaatio>,
    modalCloseFn: (any) => void,
    modalOpen: boolean,
    basicInfo: KutsuBasicInfo,
    clearBasicInfo: () => void,
    locale: string,
    l10n: L10n,
}

type State = {
    notifications: Array<string>,
    loading: boolean,
    sent: boolean,
}

export default class KutsuConfirmation extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            notifications: [],
            loading: false,
            sent: false
        }
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <Modal show={this.props.modalOpen} onClose={this.props.modalCloseFn} closeOnOuterClick={true}>
                <div className="confirmation-modal">
                    <i className="fa fa-times-circle fa-2 clickable right" onClick={this.props.modalCloseFn}
                       aria-hidden="true"/>
                    <span className="oph-h1 oph-strong">{L['VIRKAILIJAN_LISAYS_ESIKATSELU_OTSIKKO']}</span>
                    <p>{ L['VIRKAILIJAN_LISAYS_ESIKATSELU_TEKSTI'] } {this.props.basicInfo.email}</p>
                    <span className="oph-h2 oph-strong">{L['VIRKAILIJAN_LISAYS_ESIKATSELU_ALAOTSIKKO']}</span>
                    {this.props.addedOrgs.map(this.renderAddedOrg.bind(this))}
                    <div className="row">
                        {this.state.sent
                            ? <Button action={this.onClose.bind(this)}>{L['VIRKAILIJAN_LISAYS_LAHETETTY']}</Button>
                            : <Button action={this._sendInvitation.bind(this)} loading={this.state.loading}>{L['VIRKAILIJAN_LISAYS_TALLENNA']}</Button>
                        }
                    </div>

                    <LocalNotification type="error" title={L['KUTSU_LUONTI_EPAONNISTUI']} toggle={this.state.notifications.length > 0}>
                        <ul>
                            {this.state.notifications.map((notification, index) => <li key={index}>{notification}</li>)}
                        </ul>
                    </LocalNotification>
                </div>
            </Modal>
        )
    }

    onClose() {
        this.props.modalCloseFn();
        this.setState({sent: false});
    }

    renderAddedOrg(org: any) {
        return (
            <div key={org.organisation.oid}>
                <span className="oph-h3 oph-strong">{org.organisation.name}</span>
                {org.selectedPermissions.map(this.renderAddedOrgPermission.bind(this))}
            </div>
        )
    }

    renderAddedOrgPermission(permission: MyonnettyKayttooikeusryhma) {
        return (
            <div key={permission.ryhmaId}>
                <span className="oph-h4 oph-strong">{toLocalizedText(this.props.locale, permission.ryhmaNames)}</span>
            </div>
        )
    }

    _sendInvitation(e: SyntheticEvent<HTMLButtonElement>) {
        this.sendInvitation(e, this.props.l10n[this.props.locale]);
    }

    async sendInvitation(e: SyntheticEvent<HTMLButtonElement>, L: Localisations) {

        e.preventDefault();

        const sahkoposti = this.props.basicInfo.email && this.props.basicInfo.email.trim();
        const payload = {
            etunimi: this.props.basicInfo.etunimi,
            sukunimi: this.props.basicInfo.sukunimi,
            sahkoposti,
            asiointikieli: this.props.basicInfo.languageCode,
            saate: this.props.basicInfo.saate ? this.props.basicInfo.saate : undefined,
            organisaatiot: R.map(addedOrg => ({
                organisaatioOid: addedOrg.oid,
                voimassaLoppuPvm: addedOrg.voimassaLoppuPvm,
                kayttoOikeusRyhmat: R.map(selectedPermission => ({
                    id: selectedPermission.ryhmaId
                }))(addedOrg.selectedPermissions)
            }))(this.props.addedOrgs)
        };

        try {
            this.setState({loading: true});
            const url = urls.url('kayttooikeus-service.kutsu');
            await http.post(url, payload);
            this.setState({loading: false, sent: true});
        } catch (error) {
            const notifications = [];
            if (error && error.message === 'kutsu_with_sahkoposti_already_sent') {
                notifications.push(L['KUTSU_LUONTI_EPAONNISTUI_ON_JO_LAHETETTY'])
            } else {
                notifications.push(L['KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE'])
            }
            this.setState({loading: false, notifications: notifications});
            throw error;
        }
    }
}

