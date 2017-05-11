import React from 'react';
import classNames from 'classnames/bind';
import './PasswordPopupContent.css';

export default class PasswordPopupContent extends React.Component {

    static propTypes = {
        henkiloOid: React.PropTypes.string.isRequired,
        L: React.PropTypes.object.isRequired,
        updatePassword: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            passwordValid: null,
            passwordConfirmed: '',
            passwordConfirmedValid: null
        }
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
                               value={this.state.password} onChange={this.handlePasswordChange.bind(this)}/>
                    </div>
                    <div className='password-controls'>
                        <label>{L['SALASANA_VAHVISTA']}</label>
                        <input className={passwordConfirmedClass} type='password' aria-required='true'
                               value={this.state.passwordConfirmed} onChange={this.handlePasswordConfirmedChange.bind(this)} />
                    </div>
                    <p>{L['SALASANA_SAANTO']}</p>
                    <button className='oph-button oph-button-primary' disabled={this.state.passwordValid !== true || this.state.passwordConfirmedValid !== true} onClick={() => this.changePassword()}>{L['SALASANA_ASETA']}</button>
                </div>);
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value, passwordValid: this.validatePassword(event.target.value)});
    }

    handlePasswordConfirmedChange(event) {
        this.setState({passwordConfirmed: event.target.value, passwordConfirmedValid: this.validateConfirmedPassword(event.target.value)});
    }

    validatePassword(password) {
        return this._checkPasswordRules(password);
    }

    validateConfirmedPassword(password) {
        return this.state.password === password;
    }

    changePassword() {
        this.props.updatePassword(this.props.henkiloOid, this.state.password);
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