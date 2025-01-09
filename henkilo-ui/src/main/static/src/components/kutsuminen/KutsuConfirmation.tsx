import React from 'react';
import Modal from '../common/modal/Modal';
import Button from '../common/button/Button';
import { toLocalizedText } from '../../localizabletext';
import './KutsuConfirmation.css';
import { http } from '../../http';
import { urls } from 'oph-urls-js';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Localisations } from '../../types/localisation.type';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { Locale } from '../../types/locale.type';

type Props = {
    addedOrgs: readonly KutsuOrganisaatio[];
    modalCloseFn: (arg0: React.SyntheticEvent<EventTarget>) => void;
    modalOpen: boolean;
    basicInfo: KutsuBasicInfo;
    resetFormValues: () => void;
    locale: Locale;
    L: Localisations;
};

type State = {
    notifications: Array<string>;
    loading: boolean;
    sent: boolean;
};

export default class KutsuConfirmation extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            notifications: [],
            loading: false,
            sent: false,
        };
    }

    render() {
        const { L } = this.props;
        return (
            <Modal show={this.props.modalOpen} onClose={this.props.modalCloseFn} closeOnOuterClick={true}>
                <div className="confirmation-modal">
                    <i
                        className="fa fa-times-circle fa-2 clickable right"
                        onClick={this.props.modalCloseFn}
                        aria-hidden="true"
                    />
                    <span className="oph-h1 oph-strong">{L['VIRKAILIJAN_LISAYS_ESIKATSELU_OTSIKKO']}</span>
                    <p>
                        {L['VIRKAILIJAN_LISAYS_ESIKATSELU_TEKSTI']} {this.props.basicInfo.email}
                    </p>
                    <span className="oph-h2 oph-strong">{L['VIRKAILIJAN_LISAYS_ESIKATSELU_ALAOTSIKKO']}</span>
                    {this.props.addedOrgs.map(this.renderAddedOrg.bind(this))}
                    <div className="row">
                        {this.state.sent ? (
                            <Button action={this.onClose.bind(this)}>{L['VIRKAILIJAN_LISAYS_LAHETETTY']}</Button>
                        ) : (
                            <Button action={this._sendInvitation.bind(this)} loading={this.state.loading}>
                                {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                            </Button>
                        )}
                    </div>

                    <LocalNotification
                        type="error"
                        title={L['KUTSU_LUONTI_EPAONNISTUI']}
                        toggle={this.state.notifications.length > 0}
                    >
                        <ul>
                            {this.state.notifications.map((notification, index) => (
                                <li key={index}>{notification}</li>
                            ))}
                        </ul>
                    </LocalNotification>
                </div>
            </Modal>
        );
    }

    onClose(e: React.SyntheticEvent<HTMLElement>) {
        this.props.resetFormValues();
        this.props.modalCloseFn(e);
        this.setState({ sent: false });
    }

    renderAddedOrg(org: KutsuOrganisaatio) {
        return (
            <div key={org.organisation.oid}>
                <span className="oph-h3 oph-strong">{org.organisation.name}</span>
                {org.selectedPermissions.map(this.renderAddedOrgPermission.bind(this))}
            </div>
        );
    }

    renderAddedOrgPermission(permission: MyonnettyKayttooikeusryhma) {
        return (
            <div key={permission.ryhmaId}>
                <span className="oph-h4 oph-strong">{toLocalizedText(this.props.locale, permission.ryhmaNames)}</span>
            </div>
        );
    }

    _sendInvitation(e: React.SyntheticEvent<HTMLButtonElement>) {
        this.sendInvitation(e, this.props.L);
    }

    async sendInvitation(e: React.SyntheticEvent<HTMLButtonElement>, L: Localisations) {
        e.preventDefault();

        const sahkoposti = this.props.basicInfo.email && this.props.basicInfo.email.trim();
        const payload = {
            etunimi: this.props.basicInfo.etunimi,
            sukunimi: this.props.basicInfo.sukunimi,
            sahkoposti,
            asiointikieli: this.props.basicInfo.languageCode,
            saate: this.props.basicInfo.saate ? this.props.basicInfo.saate : undefined,
            organisaatiot: this.props.addedOrgs.map((addedOrg) => ({
                organisaatioOid: addedOrg.organisation.oid,
                voimassaLoppuPvm: addedOrg.voimassaLoppuPvm,
                kayttoOikeusRyhmat: addedOrg.selectedPermissions.map((selectedPermission) => ({
                    id: selectedPermission.ryhmaId,
                })),
            })),
        };

        try {
            this.setState({ loading: true });
            const url = urls.url('kayttooikeus-service.kutsu');
            await http.post(url, payload);
            this.setState({ loading: false, sent: true });
        } catch (error) {
            const notifications = [];
            notifications.push(L['KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE']);
            this.setState({ loading: false, notifications: notifications });
            throw error;
        }
    }
}
