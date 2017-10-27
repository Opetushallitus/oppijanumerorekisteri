// @flow
import React from 'react';
import type {KayttooikeusryhmaKuvaus} from "./KayttooikeusryhmaPage";
import './KayttooikeusryhmatKuvaus.css';

type Props = {
    L: any,
    description: KayttooikeusryhmaKuvaus,
    setDescription: (string, string) => void
}

export default class KayttooikeusryhmatKuvaus extends React.Component<Props> {

    render() {
        return <div className="kayttooikeusryhmat-kuvaus">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS']}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-fi">FI</label>
                <textarea id="kayttooikeusryhma-kuvaus-fi" className="oph-input" type="text" value={this.props.description.fi} onChange={ (event) => this.props.setDescription('fi', event.target.value) }/>
            </div>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-sv">SV</label>
                <textarea id="kayttooikeusryhma-kuvaus-sv" className="oph-input" type="text" value={this.props.description.sv} onChange={ (event) => this.props.setDescription('sv', event.target.value) }/>
            </div>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-en">EN</label>
                <textarea id="kayttooikeusryhma-kuvaus-en" className="oph-input" type="text" value={this.props.description.en} onChange={ (event) => this.props.setDescription('en', event.target.value) }/>
            </div>
        </div>
    }

}