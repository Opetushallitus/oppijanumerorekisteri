// @flow
import React from 'react';
import type {NewKayttoikeusryhmaKuvaus} from "../kayttooikeusryhmat.types";

type Props = {
    L: any,
    description: NewKayttoikeusryhmaKuvaus
}

export default class KayttooikeusryhmatKuvaus extends React.Component<Props> {

    render() {
        return <div className="kayttooikeusryhmat-kuvaus">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS']}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-kuvaus-fi">FI</label>
                <textarea id="kayttooikeusryhma-kuvaus-fi" className="oph-input" type="text" />
            </div>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-kuvaus-sv">SV</label>
                <textarea id="kayttooikeusryhma-kuvaus-sv" className="oph-input" type="text" />
            </div>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-kuvaus-en">EN</label>
                <textarea id="kayttooikeusryhma-kuvaus-en" className="oph-input" type="text" />
            </div>
        </div>
    }

}