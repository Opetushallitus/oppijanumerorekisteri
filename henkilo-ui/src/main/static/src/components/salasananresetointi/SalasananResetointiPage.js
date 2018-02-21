// @flow

import React from 'react';
import {connect} from 'react-redux';
import type {Locale} from '../../types/locale.type';
import type {L} from '../../types/localisation.type';
import './SalasananResetointiPage.css';
import {updateUnauthenticatedNavigation} from "../../actions/navigation.actions";
import {urls} from 'oph-urls-js';
import {http} from "../../http";
import WideRedNotification from "../common/notifications/WideRedNotification";
import WideGreenNotification from "../common/notifications/WideGreenNotification";
import {isValidPassword} from "../../validation/PasswordValidator";
import Button from '../common/button/Button';

type Props = {
    L: L,
    locale: Locale,
    updateUnauthenticatedNavigation: () => any,
    poletti: string
}

type State = {
    password: string,
    passwordAgain: string,
    loading: boolean,
    toggleVirhe: boolean,
    toggleSuccess: boolean,
    showLoginRedirect: boolean,
    showSetPassword: boolean,
    showNotFoundError: boolean,
    showForbiddenError: boolean
}

class SalasananResetointiPage extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            password: '',
            passwordAgain: '',
            loading: false,
            toggleVirhe: false,
            toggleSuccess: false,
            showLoginRedirect: false,
            showSetPassword: true,
            showNotFoundError: false,
            showForbiddenError: false
        };
    }

    componentDidMount() {
        this.props.updateUnauthenticatedNavigation();
    }

    render() {
        const baseErrorMessage = this.props.L['SALASANA_VIRHE'];
        let errorMessage = '';
        if( this.state.showNotFoundError ) {
            errorMessage = `${baseErrorMessage} ${this.props.L['SALASANA_POLETTIA_EI_LOYTYNYT']}`;
        } else if (this.state.showForbiddenError) {
            errorMessage = `${baseErrorMessage} ${this.props.L['SALASANA_POLETTI_EI_VOIMASSA']}`;
        }

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
                    <WideRedNotification message={errorMessage}
                                         closeAction={() => this.setState({toggleVirhe: false})}/>
                    : null }
            
                { this.state.toggleSuccess ? 
                    <WideGreenNotification message={this.props.L['SALASANA_ONNISTUI']} closeAction={() => this.setState({toggleSuccess: false})}/>
                    : null}

                { this.state.showSetPassword ?
                <Button action={(event) => this.submitForm(event)} disabled={!this.validPassword()} loading={this.state.loading}
                    className="set-password">{this.props.L['SALASANA_RESETOINTI_ASETA']}</Button>
                    : null }

                { this.state.showLoginRedirect ?
                <button className="oph-button oph-button-primary set-password"
                        onClick={(event) => this.toLogin(event)}>{this.props.L['SALASANA_KIRJAUTUMISEEN']}</button>
                    : null }

            </form>
        </div>
    }

    validPassword() {
        return this.state.password === this.state.passwordAgain
            && isValidPassword(this.state.password);
    }

    setPassword = (event) => {
        this.setState({password: event.target.value});
    };

    setPasswordAgain = (event) => {
        this.setState({passwordAgain: event.target.value});
    };

    toLogin = (event) => {
        event.preventDefault();
        const url = urls.url('virkailijan-tyopoyta.base');
        document.location.href = url;
    };

    submitForm = async (event) => {
        event.preventDefault();
        const url = urls.url('kayttooikeus-service.salasana.resetointi', this.props.poletti);
        try {
            this.setState({
                loading: true,
            })
            await http.post(url, this.state.password);
            this.setState({
                loading: false,
                toggleSuccess: true,
                showLoginRedirect: true,
                showSetPassword: false
            });
        } catch (error) {
            const newState = { loading: false }
            if(error.errorType === 'NotFoundException') {
                this.setState({ ...newState, showNotFoundError: true});
            } else if(error.errorType === 'ForbiddenException') {
                this.setState({ ...newState, showForbiddenError: true});
            }

            this.setState({ ...newState, toggleVirhe: true});

            throw error;
        }
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        locale: ownProps.params['locale'].toLowerCase(),
        L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
        poletti: ownProps.params.poletti
    };
};

export default connect(mapStateToProps, {updateUnauthenticatedNavigation})(SalasananResetointiPage);
