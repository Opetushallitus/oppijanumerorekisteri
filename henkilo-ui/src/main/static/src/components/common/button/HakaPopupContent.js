import React from 'react';
import PropTypes from 'prop-types'
import {urls} from 'oph-urls-js';
import {http} from '../../../http';
import * as R from 'ramda';
import './HakaPopupContent.css';

export default class HakatunnistePopupContent extends React.Component {

    static propTypes = {
        henkiloOid: PropTypes.string.isRequired,
        l10n: PropTypes.object,
        locale: PropTypes.string,
        L: PropTypes.object
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
        const L = this.props.L ? this.props.L : this.props.l10n[this.props.locale];
        return (<div className="hakapopupcontent">
            <ul>
                { this.state.hakatunnisteet.length > 0 ? this.state.hakatunnisteet.map(hakatunniste =>
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    (<li className="tag" key={hakatunniste}><span>{hakatunniste}</span> <a className="remove"
                                                                                           onClick={ () => this.removeHakatunniste(hakatunniste)}>{L['POISTA']}</a>
                    </li>)) : <span className="oph-h4 oph-strong hakapopup">{L['EI_HAKATUNNUKSIA']}</span>}
            </ul>
            <div className="oph-field oph-field-is-required">
                <input type="text"
                       className="oph-input haka-input"
                       aria-required="true"
                       placeholder="Lisää uusi tunnus"
                       value={this.state.newTunnisteValue}
                       onChange={this.handleChange.bind(this)}
                       onKeyPress={ (e) => e.key === 'Enter' ? this.addHakatunniste() : null}/>
                <button className="save oph-button oph-button-primary"
                        onClick={() => this.addHakatunniste()}>{L['TALLENNA_TUNNUS']}</button>
            </div>
        </div>);
    }

    handleChange(event) {
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

    async removeHakatunniste(tunniste) {
        const filteredTunnisteet = R.reject((hakatunniste) => hakatunniste === tunniste)(this.state.hakatunnisteet);
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

    async saveHakatunnisteet(newHakatunnisteet) {
        const url = urls.url('kayttooikeus-service.henkilo.hakatunnus', this.props.henkiloOid);
        try {
            const hakatunnisteet = await http.put(url, newHakatunnisteet);
            this.setState({hakatunnisteet});
        } catch (error) {
            throw error;
        }
    }

}
