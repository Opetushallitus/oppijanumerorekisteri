// @flow

import React from 'react';
import {urls} from 'oph-urls-js';
import {http} from '../../../http';
import {reject} from 'ramda';
import './HakaPopupContent.css';
import type {Localisations} from "../../../types/localisation.type";

type Props = {
    henkiloOid: string,
    L: Localisations
}

type State = {
    hakatunnisteet: Array<string>,
    newTunnisteValue: string
}

export default class HakatunnistePopupContent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            hakatunnisteet: [],
            newTunnisteValue: ''
        }
    }

    async componentDidMount() {
        const tunnisteet = await this.getHakatunnisteet();
        this.setState({
            hakatunnisteet: tunnisteet
        })
    }

    render() {
        return (<div className="hakapopupcontent">
            <ul>
                { this.state.hakatunnisteet.length > 0 ? this.state.hakatunnisteet.map(hakatunniste =>
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    (<li className="tag" key={hakatunniste}><span>{hakatunniste}</span> <a className="remove"
                                                                                           onClick={ () => this.removeHakatunniste(hakatunniste)}>{this.props.L['POISTA']}</a>
                    </li>)) : <span className="oph-h4 oph-strong hakapopup">{this.props.L['EI_HAKATUNNUKSIA']}</span>}
            </ul>
            <div className="oph-field oph-field-is-required">
                <input type="text"
                       className="oph-input haka-input"
                       aria-required="true"
                       placeholder="Lisää uusi tunnus"
                       value={this.state.newTunnisteValue}
                       onChange={this.handleChange.bind(this)}
                       onKeyPress={ (e: SyntheticKeyboardEvent<HTMLInputElement>) => e.key === 'Enter' ? this.addHakatunniste() : null}/>
                { this.state.hakatunnisteet.includes(this.state.newTunnisteValue) ?
                    <div className="oph-field-text oph-error">{this.props.L['HAKATUNNISTEET_VIRHE_OLEMASSAOLEVA']}</div> :
                    null }
                <button className="save oph-button oph-button-primary"
                        disabled={this.state.hakatunnisteet.includes(this.state.newTunnisteValue)}
                        onClick={() => this.addHakatunniste()}>{this.props.L['TALLENNA_TUNNUS']}</button>
            </div>
        </div>);
    }

    handleChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({newTunnisteValue: event.target.value});
    }

    addHakatunniste() {
        if (this.state.newTunnisteValue.length > 0) {
            const tunnisteet = this.state.hakatunnisteet.slice(0);
            tunnisteet.push(this.state.newTunnisteValue);
            this.saveHakatunnisteet(tunnisteet);
            this.setState({newTunnisteValue: ''});
        }
    }

    async removeHakatunniste(tunniste: string) {
        const filteredTunnisteet = reject((hakatunniste) => hakatunniste === tunniste)(this.state.hakatunnisteet);
        await this.saveHakatunnisteet(filteredTunnisteet);
    }

    async getHakatunnisteet() {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.get(url);
            return hakatunnisteet;
        } catch (error) {
            throw error;
        }
    }

    async saveHakatunnisteet(newHakatunnisteet: Array<string>) {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.put(url, newHakatunnisteet);
            this.setState({hakatunnisteet});
        } catch (error) {
            throw error;
        }
    }

}

