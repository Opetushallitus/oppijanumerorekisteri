import React from 'react';
import PropTypes from 'prop-types'
import classNames from 'classnames/bind';
import Notifications from "../notifications/Notifications"
import './PasswordPopupContent.css';

export default class PasswordPopupContent extends React.Component {

    static propTypes = {
        oidHenkilo: PropTypes.string.isRequired,
        L: PropTypes.object.isRequired,
        updatePassword: PropTypes.func.isRequired,
        notifications: PropTypes.shape({
            updatePassword: PropTypes.array.isRequired,
        }),
        removeNotification: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            passwordValid: null,
            passwordConfirmed: '',
            passwordConfirmedValid: null,
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
                       L={L} styles={{marginTop: '10px', wordBreak: 'normal'}}
                       closeAction={(status, id) => this.props.removeNotification(status, 'updatePassword', id)} />
                </div>);
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value,
            passwordValid: this.validatePassword(event.target.value),
            passwordConfirmedValid: false});
    }

    handlePasswordConfirmedChange(event) {
        this.setState({passwordConfirmed: event.target.value,
            passwordConfirmedValid: this.validateConfirmedPassword(event.target.value)});
    }

    validatePassword(password) {
        return this._checkPasswordRules(password);
    }

    validateConfirmedPassword(password) {
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
    _checkPasswordRules(password) {
        let format = new RegExp(/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/);
        return (password.length >= 8 && format.test(password));
    }

}