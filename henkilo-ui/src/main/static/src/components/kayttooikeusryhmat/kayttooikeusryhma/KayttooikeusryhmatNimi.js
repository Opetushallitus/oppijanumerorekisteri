// @flow
import React from 'react';
import type {KayttooikeusryhmaNimi} from "./KayttooikeusryhmaPage";
import './KayttooikeusryhmatNimi.css';
import type {L} from "../../../types/localisation.type";

type Props = {
    L: L,
    name: KayttooikeusryhmaNimi,
    setName: (string, string) => void
}

export default class KayttooikeusryhmatNimi extends React.Component<Props> {

    render() {
        return <div className="kayttooikeusryhmat-nimi">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_NIMI']}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-fi">FI</label>
                <input id="kayttooikeusryhma-nimi-fi" className="oph-input" type="text" value={this.props.name.fi} onChange={ (event) => this.props.setName('fi', event.target.value) }/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-sv">SV</label>
                <input id="kayttooikeusryhma-nimi-sv" className="oph-input" type="text" value={this.props.name.sv} onChange={ (event) => this.props.setName('sv', event.target.value) }/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-en">EN</label>
                <input id="kayttooikeusryhma-nimi-en" className="oph-input" type="text" value={this.props.name.en} onChange={ (event) => this.props.setName('en', event.target.value) }/>
            </div>
        </div>
    }

}