import React from "react";
import PropTypes from 'prop-types'
import * as R from "ramda";
import Modal from "../common/modal/Modal";
import Button from "../common/button/Button";
import {toLocalizedText} from '../../localizabletext';
import './KutsuConfirmation.css';
import {http} from '../../http';
import {urls} from 'oph-urls-js';

export default class KutsuConfirmation extends React.Component {

    static propTypes = {
        addedOrgs: PropTypes.array,
        modalCloseFn: PropTypes.func,
        modalOpen: PropTypes.bool,
        basicInfo: PropTypes.object,
        clearBasicInfo: PropTypes.func,
        locale: PropTypes.string
    };

    constructor() {
        super();
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
                        {this.state.sent ?
                            <Button action={this.onClose.bind(this)}>{L['VIRKAILIJAN_LISAYS_LAHETETTY']}</Button> :
                            <Button action={this.sendInvitation.bind(this)}>{L['VIRKAILIJAN_LISAYS_TALLENNA']}</Button>
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

    renderAddedOrg(org) {
        const orgName = toLocalizedText(this.props.locale, org.organisation.nimi);
        return (
            <div key={org.organisation.oid}>
                <span className="oph-h3 oph-strong">{orgName}</span>
                {org.selectedPermissions.map(this.renderAddedOrgPermission.bind(this))}
            </div>
        )
    }

    renderAddedOrgPermission(permission) {
        return (
            <div key={permission.ryhmaId}>
                <span className="oph-h4 oph-strong">{toLocalizedText(this.props.locale, permission.ryhmaNames)}</span>
            </div>
        )
    }

    async sendInvitation(e) {
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
