// @flow
import React from 'react';
import type {NewKayttooikeusryhmaNimi} from "../kayttooikeusryhmat.types";
import './KayttooikeusryhmatNimi.css';

type Props = {
    L: any,
    name: NewKayttooikeusryhmaNimi
}

export default class KayttooikeusryhmatNimi extends React.Component<Props> {

    render() {
        return <div className="kayttooikeusryhmat-nimi">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_NIMI']}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-fi">FI</label>
                <input id="kayttooikeusryhma-nimi-fi" className="oph-input" type="text"/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-sv">SV</label>
                <input id="kayttooikeusryhma-nimi-sv" className="oph-input" type="text"/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-en">EN</label>
                <input id="kayttooikeusryhma-nimi-en" className="oph-input" type="text"/>
            </div>
        </div>
    }

}