import React from 'react';
import type { LocalizableField } from './KayttooikeusryhmaPage';
import './KayttooikeusryhmatNimi.css';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    name: LocalizableField;
    setName: (arg0: string, arg1: string) => void;
};

export default class KayttooikeusryhmatNimi extends React.Component<Props> {
    render() {
        return (
            <div className="kayttooikeusryhmat-nimi">
                <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_NIMI']}</h4>
                <div className="oph-field oph-field-inline oph-field-is-required">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-fi">
                        FI
                    </label>
                    <input
                        id="kayttooikeusryhma-nimi-fi"
                        className="oph-input"
                        type="text"
                        value={this.props.name.FI}
                        onChange={(event) => this.props.setName('FI', event.target.value)}
                    />
                </div>

                <div className="oph-field oph-field-inline oph-field-is-required">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-sv">
                        SV
                    </label>
                    <input
                        id="kayttooikeusryhma-nimi-sv"
                        className="oph-input"
                        type="text"
                        value={this.props.name.SV}
                        onChange={(event) => this.props.setName('SV', event.target.value)}
                    />
                </div>

                <div className="oph-field oph-field-inline oph-field-is-required">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-en">
                        EN
                    </label>
                    <input
                        id="kayttooikeusryhma-nimi-en"
                        className="oph-input"
                        type="text"
                        value={this.props.name.EN}
                        onChange={(event) => this.props.setName('EN', event.target.value)}
                    />
                </div>
            </div>
        );
    }
}
