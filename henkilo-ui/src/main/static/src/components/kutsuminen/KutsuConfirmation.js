// @flow
import React from "react";
import PropTypes from 'prop-types'
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
import type {BasicinfoType} from "./BasicinfoForm";
import type {L10n} from "../../types/localisation.type";
import type { MyonnettyKayttooikeusryhma } from "../../types/domain/kayttooikeus/kayttooikeusryhma.types"

type Props = {
    addedOrgs: Array<KutsuOrganisaatio>,
    modalCloseFn: (any) => void,
    modalOpen: boolean,
    basicInfo: BasicinfoType,
    clearBasicInfo: () => void,
    locale: string,
    l10n: L10n,
}

type State = {
    sent: boolean,
}

export default class KutsuConfirmation extends React.Component<Props, State> {

    static propTypes = {
        addedOrgs: PropTypes.array,
        modalCloseFn: PropTypes.func,
        modalOpen: PropTypes.bool,
        basicInfo: PropTypes.object,
        clearBasicInfo: PropTypes.func,
        locale: PropTypes.string,
        l10n: PropTypes.object,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
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
                            : <Button action={this._sendInvitation.bind(this)}>{L['VIRKAILIJAN_LISAYS_TALLENNA']}</Button>
                        }
                    </div>
                </div>
            </Modal>
        )
    }

    onClose() {
        this.props.modalCloseFn();
        this.setState({sent: false});
    }

    renderAddedOrg(org: any) {
        const orgName = toLocalizedText(this.props.locale, org.organisation.nimi);
        return (
            <div key={org.organisation.oid}>
                <span className="oph-h3 oph-strong">{orgName}</span>
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

    _sendInvitation(e: Event) {
        this.sendInvitation(e);
    }

    async sendInvitation(e: Event) {
        e.preventDefault();

        const payload = {
            etunimi: this.props.basicInfo.etunimi,
            sukunimi: this.props.basicInfo.sukunimi,
            sahkoposti: this.props.basicInfo.email,
            asiointikieli: this.props.basicInfo.languageCode,
            organisaatiot: R.map(addedOrg => ({
                organisaatioOid: addedOrg.oid,
                kayttoOikeusRyhmat: R.map(selectedPermission => ({
                    id: selectedPermission.ryhmaId
                }))(addedOrg.selectedPermissions)
            }))(this.props.addedOrgs)
        };

        try {
            const url = urls.url('kayttooikeus-service.kutsu');
            await http.post(url, payload);
            this.setState({sent: true});
        } catch (error) {
            throw error;
        }
    }
}
