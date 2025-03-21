import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import classNames from 'classnames';
import './PasswordPopupContent.css';
import { Localisations } from '../../../types/localisation.type';
import { isValidPassword } from '../../../validation/PasswordValidator';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { NOTIFICATIONTYPES } from '../Notification/notificationtypes';
import { urls } from 'oph-urls-js';
import { http } from '../../../http';
import PropertySingleton from '../../../globals/PropertySingleton';

type OwnProps = {
    oidHenkilo: string;
};

type StateProps = {
    L: Localisations;
};

type DispatchProps = {
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = {
    password: string;
    passwordValid: boolean | null | undefined;
    passwordConfirmed: string;
    passwordConfirmedValid: boolean | null | undefined;
};

class PasswordPopupContent extends React.Component<Props, State> {
    passwordInput: HTMLInputElement;

    constructor(props: Props) {
        super(props);
        this.state = {
            password: '',
            passwordValid: null,
            passwordConfirmed: '',
            passwordConfirmedValid: null,
        };
    }

    componentDidMount() {
        this.passwordInput.focus();
    }

    render() {
        const passwordClass = classNames('oph-input haka-input', {
            'password-invalid': this.state.passwordValid === false,
        });

        const passwordConfirmedClass = classNames('oph-input haka-input', {
            'password-invalid': this.state.passwordConfirmedValid === false,
        });

        const L = this.props.L;
        return (
            <div id="password-popup-form">
                <div className="password-controls">
                    <label>{L['SALASANA_UUSI']}</label>
                    <input
                        className={passwordClass}
                        type="password"
                        aria-required="true"
                        ref={(input) => {
                            this.passwordInput = input;
                        }}
                        value={this.state.password}
                        onChange={this.handlePasswordChange.bind(this)}
                    />
                </div>
                <div className="password-controls">
                    <label>{L['SALASANA_VAHVISTA']}</label>
                    <input
                        className={passwordConfirmedClass}
                        type="password"
                        aria-required="true"
                        value={this.state.passwordConfirmed}
                        onChange={this.handlePasswordConfirmedChange.bind(this)}
                    />
                </div>
                <p>{L['SALASANA_SAANTO']}</p>
                <button
                    className="oph-button oph-button-primary"
                    disabled={this.state.passwordValid !== true || this.state.passwordConfirmedValid !== true}
                    onClick={() => this.changePassword()}
                >
                    {L['SALASANA_ASETA']}
                </button>
                <div className="clear" />
            </div>
        );
    }

    handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            password: event.target.value,
            passwordValid: this._checkPasswordRules(event.target.value),
            passwordConfirmedValid: false,
        });
    }

    handlePasswordConfirmedChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            passwordConfirmed: event.target.value,
            passwordConfirmedValid: this.validateConfirmedPassword(event.target.value),
        });
    }

    validateConfirmedPassword(password: string) {
        return this.state.password === password;
    }

    async changePassword() {
        const url = urls.url('kayttooikeus-service.henkilo.password', this.props.oidHenkilo);
        try {
            await http.post(url, this.state.password);
            this.props.addGlobalNotification({
                key: `Password_update_${PropertySingleton.getNewId()}`,
                type: NOTIFICATIONTYPES.SUCCESS,
                title: this.props.L['NOTIFICATION_SALASANA_OK_TOPIC'],
                autoClose: 10000,
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: `Password_update_${PropertySingleton.getNewId()}`,
                type: NOTIFICATIONTYPES.ERROR,
                title: this.props.L['NOTIFICATION_SALASANA_ERROR_TOPIC'],
                autoClose: 10000,
            });
            throw error;
        }
    }

    _checkPasswordRules(password: string) {
        return isValidPassword(password);
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    addGlobalNotification,
})(PasswordPopupContent);
