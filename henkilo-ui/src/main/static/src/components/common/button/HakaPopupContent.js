
import React from 'react';
import {urls} from 'oph-urls-js';
import {http} from '../../../http';
import R from 'ramda';
import './HakaPopupContent.css';

export default class HakatunnistePopupContent extends React.Component {

    static propTypes = {
        henkiloOid: React.PropTypes.string.isRequired,
        l10n: React.PropTypes.object.isRequired
    };

    constructor(props) {
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
        const L = this.props.l10n[this.props.locale];
        return (<div>
            <ul>
                {this.state.hakatunnisteet.length > 0 ? this.state.hakatunnisteet.map(hakatunniste =>
                        (<li key={hakatunniste}>{hakatunniste} <a onClick={ () => this.removeHakatunniste(hakatunniste)}>{L['POISTA']}</a>
            </li>)) : <h3>{L['EI_HAKATUNNUKSIA']}</h3> }
            </ul>
            <div className="oph-field oph-field-is-required">
                <input type="text"
                       className="oph-input haka-input"
                       aria-required="true"
                       placeholder="Lisää uusi tunnus"
                       value={this.state.newTunnisteValue}
                       onChange={this.handleChange.bind(this)}
                       onKeyPress={ (e) => e.key === 'Enter' ? this.addHakatunniste() : null} />
                <button className="oph-button oph-button-primary" onClick={() => this.addHakatunniste()}>{L['TALLENNA_TUNNUS']}</button>
            </div>
        </div>);
    }

    handleChange(event) {
        this.setState({newTunnisteValue: event.target.value});
    }

    async addHakatunniste() {
        const tunnisteet = this.state.hakatunnisteet.slice(0);
        tunnisteet.push(this.state.newTunnisteValue);
        this.saveHakatunnisteet(tunnisteet);
        this.setState({newTunnisteValue: ''});
    }

    async removeHakatunniste(tunniste) {
        const filteredTunnisteet = R.reject( (hakatunniste) => hakatunniste === tunniste)(this.state.hakatunnisteet);
        await this.saveHakatunnisteet(filteredTunnisteet);
    }

    async getHakatunnisteet() {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.get(url);
            return hakatunnisteet;
        } catch (error) {
            console.error('Fetching hakatunnisteet failed', error);
            throw error;
        }
    }

    async saveHakatunnisteet(newHakatunnisteet) {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.put(url, newHakatunnisteet);
            this.setState({hakatunnisteet});
        } catch (error) {
            console.error('Saving hakatunnisteet list failed', error);
            throw error;
        }
    }

}
