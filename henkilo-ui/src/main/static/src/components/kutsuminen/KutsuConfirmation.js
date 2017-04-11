import React from "react";
import R from "ramda";
import Modal from "../common/modal/Modal";
import Button from "../common/button/Button";
import locale from '../../configuration/locale';
import {toLocalizedText} from '../../localizabletext';
import './KutsuConfirmation.css';
import {http} from '../../http';
import {urls} from 'oph-urls-js';

class KutsuConfirmation extends React.Component {

    constructor() {
        super();
        this.state = {
            sent: false
        }
    }

    render() {
        const L = this.props.l10n[locale];

        return (
            <Modal show={this.props.modalOpen} onClose={this.props.modalCloseFn} closeOnOuterClick={true}>
                <div className="confirmation-modal">
                    <i className="fa fa-times-circle fa-2 clickable right" onClick={this.props.modalCloseFn}
                       aria-hidden="true"></i>
                    <h1>{L['VIRKAILIJAN_LISAYS_ESIKATSELU_OTSIKKO']}</h1>
                    {/*<p>{L.msg('VIRKAILIJAN_LISAYS_ESIKATSELU_TEKSTI', this.props.basicInfo.email, this.props.basicInfo.etunimi, this.props.basicInfo.sukunimi)}</p>*/}
                    <h2>{L['VIRKAILIJAN_LISAYS_ESIKATSELU_ALAOTSIKKO']}</h2>
                    {this.props.addedOrgs.map(this.renderAddedOrg.bind(this))}
                    <div className="row">
                        <Button confirm className="left" action={this.sendInvitation.bind(this)}>
                            {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                        </Button>
                    </div>
                    <div className="clear"></div>
                    <p>{this.state.sent ? L['VIRKAILIJAN_LISAYS_LAHETETTY'] : ''}</p>
                </div>
            </Modal>
        )
    }

    renderAddedOrg(org) {
        const orgName = toLocalizedText(locale, org.organisation.nimi);
        return (
            <div key={org.organisation.oid}>
                <h3>{orgName}</h3>
                {org.selectedPermissions.map(this.renderAddedOrgPermission.bind(this))}
            </div>
        )
    }

    renderAddedOrgPermission(permission) {
        return (
            <div key={permission.ryhmaId}>
                <h4>{toLocalizedText(locale, permission.ryhmaNames)}</h4>
            </div>
        )
    }

    async sendInvitation(e) {
        e.preventDefault();
        console.log('props', this.props);
        
        
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
            const invitation = await http.post(url, payload);
            this.props.basicInfo.clearBasicInfo();
            console.log(invitation);
        } catch (error) {
            console.error(`Creating new virkailija kutsu failed`, error);
            throw error;
        }

        // const {invitationResponseS} = kutsu(payload);
        //
        // invitationResponseS.onValue(response => {
        //     this.props.basicInfo.clear();
        //     if (this.props.ready) {
        //         this.props.ready(true);
        //     } else {
        //         this.setState({sent: true});
        //     }
        // });
        // invitationResponseS.onError(() => {
        //     if (this.props.ready) {
        //         this.props.ready(false);
        //     }
        // });
    }
}

KutsuConfirmation.propTypes = {
    addedOrgs: React.PropTypes.array,
    modalCloseFn: React.PropTypes.func,
    modalOpen: React.PropTypes.bool,
    basicInfo: React.PropTypes.object,
    clearBasicInfo: React.PropTypes.func,
    ready: React.PropTypes.func
};

export default KutsuConfirmation;