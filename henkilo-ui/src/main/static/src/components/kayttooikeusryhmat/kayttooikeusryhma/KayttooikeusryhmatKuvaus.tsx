import React from 'react';
import type { LocalizableField } from './KayttooikeusryhmaPage';
import './KayttooikeusryhmatKuvaus.css';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    description: LocalizableField;
    setDescription: (arg0: string, arg1: string) => void;
};

export default class KayttooikeusryhmatKuvaus extends React.Component<Props> {
    render() {
        return (
            <div className="kayttooikeusryhmat-kuvaus">
                <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS']}</h4>
                <div className="oph-field oph-field-inline oph-field-is-required">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-fi">
                        FI
                    </label>
                    <textarea
                        id="kayttooikeusryhma-kuvaus-fi"
                        className="oph-input"
                        value={this.props.description.FI}
                        onChange={event => this.props.setDescription('FI', event.target.value)}
                    />
                </div>
                <div className="oph-field oph-field-inline oph-field-is-required">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-sv">
                        SV
                    </label>
                    <textarea
                        id="kayttooikeusryhma-kuvaus-sv"
                        className="oph-input"
                        value={this.props.description.SV}
                        onChange={event => this.props.setDescription('SV', event.target.value)}
                    />
                </div>
                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-kuvaus-en">
                        EN
                    </label>
                    <textarea
                        id="kayttooikeusryhma-kuvaus-en"
                        className="oph-input"
                        value={this.props.description.EN}
                        onChange={event => this.props.setDescription('EN', event.target.value)}
                    />
                </div>
            </div>
        );
    }
}
