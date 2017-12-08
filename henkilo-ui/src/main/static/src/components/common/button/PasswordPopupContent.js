// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Notifications from '../notifications/Notifications';
import './PasswordPopupContent.css';
import PropertySingleton from "../../../globals/PropertySingleton";
import type {L} from "../../../types/localisation.type";
import {updatePassword} from "../../../actions/henkilo.actions";
import {removeNotification} from "../../../actions/notifications.actions";

type Props = {
    oidHenkilo: string,
    L: L,
    updatePassword: (string, string) => void,
    notifications: {updatePassword: Array<any>},
    removeNotification: (string, string, number) => void,
}

type State = {
    password: string,
    passwordValid: ?boolean,
    passwordConfirmed: string,
    passwordConfirmedValid: ?boolean,
    passwordButtonClicked: boolean,
}

class PasswordPopupContent extends React.Component<Props, State> {
    passwordInput: any;

    static propTypes = {
        oidHenkilo: PropTypes.string.isRequired,
        L: PropTypes.object.isRequired,
        updatePassword: PropTypes.func.isRequired,
        notifications: PropTypes.shape({
            updatePassword: PropTypes.array.isRequired,
        }),
        removeNotification: PropTypes.func,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            password: '',
            passwordValid: null,
            passwordConfirmed: '',
            passwordConfirmedValid: null,
            passwordButtonClicked: false,
        }
    }

    componentDidMount() {
        this.passwordInput.focus();
    }

    componentWillUnmount() {
        this.props.removeNotification('ok', 'updatePassword', 1);
        this.props.removeNotification('error', 'updatePassword', 1);
    }

    render() {
        const passwordClass = classNames('oph-input haka-input',
            {'password-invalid': this.state.passwordValid === false});

        const passwordConfirmedClass = classNames('oph-input haka-input',
            {'password-invalid': this.state.passwordConfirmedValid === false});

        const L = this.props.L;
        return (<div id='password-popup-form'>
                    <div className='password-controls'>
                        <label>{L['SALASANA_UUSI']}</label>
                        <input className={passwordClass} type='password' aria-required='true'
                               ref={(input) => { this.passwordInput = input; }}
                               value={this.state.password} onChange={this.handlePasswordChange.bind(this)}/>
                    </div>
                    <div className='password-controls'>
                        <label>{L['SALASANA_VAHVISTA']}</label>
                        <input className={passwordConfirmedClass} type='password' aria-required='true'
                               value={this.state.passwordConfirmed} onChange={this.handlePasswordConfirmedChange.bind(this)} />
                    </div>
                    <p>{L['SALASANA_SAANTO']}</p>
                    <button className='oph-button oph-button-primary'
                            disabled={this.state.passwordValid !== true || this.state.passwordConfirmedValid !== true}
                            onClick={() => this.changePassword()}>{L['SALASANA_ASETA']}</button>
                    <div className="clear"/>
                    <Notifications notifications={this.props.notifications.updatePassword}
                                   L={L}
                                   styles={{marginTop: '10px', wordBreak: 'normal'}}
                                   closeAction={(status, id: any) => this.props.removeNotification(status, 'updatePassword', id)} />
                </div>);
    }

    handlePasswordChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({password: event.target.value,
            passwordValid: this.validatePassword(event.target.value),
            passwordConfirmedValid: false});
    }

    handlePasswordConfirmedChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({passwordConfirmed: event.target.value,
            passwordConfirmedValid: this.validateConfirmedPassword(event.target.value)});
    }

    validatePassword(password: string) {
        return this._checkPasswordRules(password);
    }

    validateConfirmedPassword(password: string) {
        return this.state.password === password;
    }

    changePassword() {
        this.props.updatePassword(this.props.oidHenkilo, this.state.password);
        this.setState({passwordButtonClicked: true});
    }

    /**
     * 8+ characters
     * Includes special characters
     */
    _checkPasswordRules(password: string) {
        return (password.length >= PropertySingleton.getState().minimunPasswordLength
            && PropertySingleton.getState().specialCharacterRegex.exec(password) !== null);
    }

}

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
    notifications: state.notifications,

});

export default connect(mapStateToProps, {updatePassword, removeNotification})(PasswordPopupContent);
