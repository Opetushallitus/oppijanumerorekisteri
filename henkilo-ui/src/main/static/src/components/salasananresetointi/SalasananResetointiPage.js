// @flow

import React from 'react';
import {connect} from 'react-redux';
import type {Locale} from '../../types/locale.type';
import type {L} from '../../types/localisation.type';
import './SalasananResetointiPage.css';

type Props = {
    L: L,
    locale: Locale
}

type State = {
    password: string,
    passwordAgain: string
}

class SalasananResetointiPage extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            password: '',
            passwordAgain: ''
        }
    }

    render() {
        return <div className="wrapper" id="salasana-resetointi">
            <form onSubmit={this.submitForm}>
                <h3>{this.props.L['SALASANA_RESETOINTI_ASETA']}</h3>

                <div className="oph-field oph-field-inline password-reset-field">
                    <label className="oph-label oph-label-long" htmlFor="password">{this.props.L['SALASANA_RESETOINTI_SALASANA']}</label>
                    <input id="password" className="oph-input" type="password" value={this.state.password} onChange={(event) => this.setPassword(event)} />
                </div>

                <div className="oph-field oph-field-inline password-reset-field">
                    <label className="oph-label oph-label-long" htmlFor="password-again">{this.props.L['SALASANA_RESETOINTI_UUDESTAAN']}</label>
                    <input id="password-again" className="oph-input" type="password" value={this.state.passwordAgain} onChange={(event) => this.setPasswordAgain(event)} />
                </div>

                <button className="oph-button oph-button-primary set-password">{this.props.L['SALASANA_RESETOINTI_ASETA']}</button>
            </form>
        </div>
    }

    setPassword = (event) => {
        this.setState({password: event.target.value});
    };

    setPasswordAgain = (event) => {
        this.setState({passwordAgain: event.target.value});
    };

    submitForm = () => {
        console.log('sumitting');
    }

}

const mapStateToProps = (state, ownProps) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(SalasananResetointiPage);