import React from 'react';
import { urls } from 'oph-urls-js';
import { http } from '../../../http';
import './SahkopostitunnistePopupContent.css';
import { Localisations } from '../../../types/localisation.type';
import Loader from '../icons/Loader';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { NOTIFICATIONTYPES } from '../Notification/notificationtypes';
import { Identification } from '../../../types/domain/oppijanumerorekisteri/Identification.types';

type OwnProps = {
    henkiloOid: string;
    L: Localisations;
};

type DispatchProps = {
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void;
};

type Props = OwnProps & DispatchProps;

type State = {
    tunnisteet: Identification[];
    newTunniste: string;
    loading: boolean;
};

class SahkopostitunnistePopupContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tunnisteet: [],
            newTunniste: '',
            loading: false,
        };
    }

    async componentDidMount() {
        await this.getTunnisteet();
    }

    render() {
        return (
            <div className="sahkopostipopup">
                <ul>
                    {this.state.loading ? (
                        <Loader />
                    ) : this.state.tunnisteet.length > 0 ? (
                        this.state.tunnisteet
                            .sort((a, b) => a.identifier.localeCompare(b.identifier))
                            .map((tunniste) => (
                                <li className="tunnistetag" key={tunniste.identifier}>
                                    <span>{tunniste.identifier}</span>
                                    {tunniste.idpEntityId === 'oppijaToken' && (
                                        <button
                                            className="oph-button"
                                            onClick={() => this.removeSahkopostitunniste(tunniste.identifier)}
                                        >
                                            {this.props.L['POISTA']}
                                        </button>
                                    )}
                                </li>
                            ))
                    ) : (
                        <span className="oph-h4 oph-strong">{this.props.L['EI_SAHKOPOSTITUNNISTEITA']}</span>
                    )}
                </ul>
                <div className="oph-field oph-field-is-required">
                    <input
                        type="text"
                        className="oph-input tunnisteinput"
                        aria-required="true"
                        placeholder="Lisää uusi tunnus"
                        value={this.state.newTunniste}
                        onChange={this.handleChange.bind(this)}
                        onKeyPress={(e) => (e.key === 'Enter' ? this.addSahkopostitunniste() : null)}
                    />
                    <button
                        className="tunnistesave oph-button oph-button-primary"
                        onClick={() => this.addSahkopostitunniste()}
                    >
                        {this.props.L['TALLENNA_TUNNUS']}
                    </button>
                </div>
            </div>
        );
    }

    handleChange(event: React.SyntheticEvent<HTMLButtonElement>) {
        this.setState({ newTunniste: event.currentTarget.value });
    }

    async addSahkopostitunniste() {
        if (this.state.newTunniste.length > 0) {
            const url = urls.url('oppijanumerorekisteri-service.henkilo.identification', this.props.henkiloOid);
            try {
                this.setState({ loading: true });
                const newTunnisteet = await http.post<Identification[]>(
                    url,
                    this.stringToIdentification(this.state.newTunniste)
                );
                this.setState({
                    newTunniste: '',
                    tunnisteet: newTunnisteet,
                    loading: false,
                });
            } catch (error) {
                this.setState({ loading: false });
                this.props.addGlobalNotification({
                    key: 'SAVE_SAHKOPOSTITUNNISTEET',
                    type: NOTIFICATIONTYPES.ERROR,
                    autoClose: 10000,
                    title: this.props.L['SAHKOPOSTITUNNISTE_TALLENNUS_VIRHE'],
                });
                throw error;
            }
        }
    }

    async removeSahkopostitunniste(tunniste: string) {
        const url = urls.url(
            'oppijanumerorekisteri-service.henkilo.identification.remove',
            this.props.henkiloOid,
            'oppijaToken',
            tunniste
        );
        try {
            this.setState({ loading: true });
            const tunnisteet = await http.delete<Identification[]>(url);
            this.setState({ loading: false, tunnisteet });
        } catch (error) {
            this.setState({ loading: false });
            this.props.addGlobalNotification({
                key: 'REMOVE_SAHKOPOSTITUNNISTEET',
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
                title: this.props.L['SAHKOPOSTITUNNISTE_POISTO_VIRHE'],
            });
            throw error;
        }
    }

    async getTunnisteet() {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.identification', this.props.henkiloOid);
        try {
            const tunnisteet = await http.get<Identification[]>(url);
            this.setState({ loading: false, tunnisteet });
        } catch (error) {
            this.setState({ loading: false });
            this.props.addGlobalNotification({
                key: 'GET_SAHKOPOSTITUNNISTEET',
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
                title: this.props.L['SAHKOPOSTITUNNISTE_HAKU_VIRHE'],
            });
            throw error;
        }
    }

    stringToIdentification(tunniste: string): Identification {
        return { identifier: tunniste, idpEntityId: 'oppijaToken' };
    }
}

export default connect<object, DispatchProps, OwnProps, RootState>(undefined, {
    addGlobalNotification,
})(SahkopostitunnistePopupContent);
