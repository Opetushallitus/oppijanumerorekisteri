import React from 'react';
import { connect } from 'react-redux';
import { urls } from 'oph-urls-js';
import { http } from '../../../http';
import { reject } from 'ramda';
import './HakaPopupContent.css';
import { Localisations } from '../../../types/localisation.type';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { NOTIFICATIONTYPES } from '../Notification/notificationtypes';

type OwnProps = {
    henkiloOid: string;
    L: Localisations;
};

type DispatchProps = {
    addGlobalNotification: (arg0: GlobalNotificationConfig) => any;
};

type Props = OwnProps & DispatchProps;

type State = {
    hakatunnisteet: string[];
    newTunnisteValue: string;
};

class HakatunnistePopupContent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hakatunnisteet: [],
            newTunnisteValue: '',
        };
    }

    async componentDidMount() {
        const tunnisteet = await this.getHakatunnisteet();
        this.setState({
            hakatunnisteet: tunnisteet,
        });
    }

    render() {
        return (
            <div className="hakapopupcontent">
                <ul>
                    {this.state.hakatunnisteet.length > 0 ? (
                        this.state.hakatunnisteet.map((
                            hakatunniste // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        ) => (
                            <li className="tag" key={hakatunniste}>
                                <span>{hakatunniste}</span>{' '}
                                <a
                                    className="remove"
                                    href="#poista"
                                    onClick={() => this.removeHakatunniste(hakatunniste)}
                                >
                                    {this.props.L['POISTA']}
                                </a>
                            </li>
                        ))
                    ) : (
                        <span className="oph-h4 oph-strong hakapopup">{this.props.L['EI_HAKATUNNUKSIA']}</span>
                    )}
                </ul>
                <div className="oph-field oph-field-is-required">
                    <input
                        type="text"
                        className="oph-input haka-input"
                        aria-required="true"
                        placeholder="Lisää uusi tunnus"
                        value={this.state.newTunnisteValue}
                        onChange={this.handleChange.bind(this)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                            e.key === 'Enter' ? this.addHakatunniste() : null
                        }
                    />
                    {this.state.hakatunnisteet.includes(this.state.newTunnisteValue) ? (
                        <div className="oph-field-text oph-error">
                            {this.props.L['HAKATUNNISTEET_VIRHE_OLEMASSAOLEVA']}
                        </div>
                    ) : null}
                    <button
                        className="save oph-button oph-button-primary"
                        disabled={this.state.hakatunnisteet.includes(this.state.newTunnisteValue)}
                        onClick={() => this.addHakatunniste()}
                    >
                        {this.props.L['TALLENNA_TUNNUS']}
                    </button>
                </div>
            </div>
        );
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ newTunnisteValue: event.target.value });
    }

    addHakatunniste() {
        if (this.state.newTunnisteValue.length > 0) {
            const tunnisteet = this.state.hakatunnisteet.slice(0);
            tunnisteet.push(this.state.newTunnisteValue);
            this.saveHakatunnisteet(tunnisteet, this.state.newTunnisteValue);
            this.setState({ newTunnisteValue: '' });
        }
    }

    async removeHakatunniste(tunniste: string) {
        const filteredTunnisteet = reject((hakatunniste) => hakatunniste === tunniste)(this.state.hakatunnisteet);
        await this.saveHakatunnisteet(filteredTunnisteet, tunniste);
    }

    async getHakatunnisteet() {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        const hakatunnisteet = await http.get<string[]>(url);
        return hakatunnisteet;
    }

    async saveHakatunnisteet(newHakatunnisteet: Array<string>, newTunnisteValue: string) {
        console.log(newHakatunnisteet);
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.put<string[]>(url, newHakatunnisteet);
            this.setState({ hakatunnisteet });
        } catch (error) {
            if (error.errorType === 'ValidationException' && error.message.indexOf('ovat jo käytössä') !== -1) {
                this.props.addGlobalNotification({
                    key: 'DUPLICATE_HAKA_KEY',
                    type: NOTIFICATIONTYPES.ERROR,
                    title: `${this.props.L['HAKATUNNISTEET_VIRHE_KAYTOSSA_ALKU']} (${newTunnisteValue}) ${this.props.L['HAKATUNNISTEET_VIRHE_KAYTOSSA_LOPPU']}`,
                    autoClose: 5000,
                });
            }
            throw error;
        }
    }
}

export default connect<{}, DispatchProps>(undefined, {
    addGlobalNotification,
})(HakatunnistePopupContent);
