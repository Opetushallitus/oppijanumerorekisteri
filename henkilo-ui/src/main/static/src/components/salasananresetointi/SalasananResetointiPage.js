// @flow

import React from 'react';
import {connect} from 'react-redux';
import type {Locale} from '../../types/locale.type';
import type {L} from '../../types/localisation.type';
import './SalasananResetointiPage.css';
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../navigation/navigationconfigurations";
import PropertySingleton from '../../globals/PropertySingleton';
import {urls} from 'oph-urls-js';
import {http} from "../../http";
import WideRedNotification from "../common/notifications/WideRedNotification";

type Props = {
    L: L,
    locale: Locale,
    updateNavigation: (any, any, string) => any,
    poletti: string
}

type State = {
    password: string,
    passwordAgain: string,
    toggleVirhe: boolean
}

class SalasananResetointiPage extends React.Component<Props, State> {


    constructor(props) {
        super(props);

        this.state = {
            password: '',
            passwordAgain: '',
            toggleVirhe: false
        }
    }

    componentWillMount() {
        this.props.updateNavigation(emptyNavi, null, '#f6f4f0');
    }

    render() {
        return <div className="wrapper" id="salasana-resetointi">
            <form >
                <h3>{this.props.L['SALASANA_RESETOINTI_ASETA']}</h3>

                <div className="oph-field oph-field-inline password-reset-field">
                    <label className="oph-label oph-label-long"
                           htmlFor="password">{this.props.L['SALASANA_RESETOINTI_SALASANA']}</label>
                    <input id="password" className="oph-input" type="password" value={this.state.password}
                           onChange={(event) => this.setPassword(event)}/>
                </div>

                <div className="oph-field oph-field-inline password-reset-field">
                    <label className="oph-label oph-label-long"
                           htmlFor="password-again">{this.props.L['SALASANA_RESETOINTI_UUDESTAAN']}</label>
                    <input id="password-again" className="oph-input" type="password" value={this.state.passwordAgain}
                           onChange={(event) => this.setPasswordAgain(event)}/>
                </div>

                <div className="oph-field oph-field-inline">
                    <div className="oph-field-text">{this.props.L['SALASANA_OHJE']}</div>
                </div>

                { this.state.toggleVirhe ?
                    <WideRedNotification message={this.props.L['SALASANA_VIRHE']}
                                         closeAction={() => this.setState({toggleVirhe: false})}></WideRedNotification>
                    : null }

                <button onClick={this.submitForm} disabled={!this.validPassword()}
                    className="oph-button oph-button-primary set-password">{this.props.L['SALASANA_RESETOINTI_ASETA']}</button>
            </form>
        </div>
    }

    validPassword() {
        return this.state.password === this.state.passwordAgain
            && this.state.password.length >= PropertySingleton.getState().minimunPasswordLength
            && PropertySingleton.getState().specialCharacterRegex.exec(this.state.password) !== null;
    }

    setPassword = (event) => {
        this.setState({password: event.target.value});
    };

    setPasswordAgain = (event) => {
        this.setState({passwordAgain: event.target.value});
    };

    submitForm = async (event) => {
        event.preventDefault();
        const url = urls.url('kayttooikeus-service.salasana.resetointi', this.props.poletti);
        try {
            http.post(url, this.state.password);
        } catch (error) {
            this.setState({toggleVirhe: true});
            throw error;
        }
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        poletti: ownProps.params.poletti
    }

};

export default connect(mapStateToProps, {updateNavigation})(SalasananResetointiPage);