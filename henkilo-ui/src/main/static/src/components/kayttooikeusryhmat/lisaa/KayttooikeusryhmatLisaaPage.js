// @flow
import React from 'react';
import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';

type NewKayttooikeusryhma = {
    organisaatioSelections: Array<any>
}

type Props = {
    L: any,
    omattiedot: any
}

type State = {
    newKayttooikeusryhma: NewKayttooikeusryhma
};

export default class KayttooikeusryhmatLisaaPage extends React.Component<Props, State> {

    state = {
        newKayttooikeusryhma: {
            organisaatioSelections: []
        }
    };

    render() {
        return <div className="wrapper">

            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_NIMI']}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-nimi-fi">FI</label>
                <input id="kayttooikeusryhma-nimi-fi" className="oph-input" type="text"/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-nimi-sv">SV</label>
                <input id="kayttooikeusryhma-nimi-sv" className="oph-input" type="text"/>
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label" htmlFor="kayttooikeusryhma-nimi-en">EN</label>
                <input id="kayttooikeusryhma-nimi-en" className="oph-input" type="text"/>
            </div>

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

            <KayttooikeusryhmanMyontoKohde L={this.props.L}
                                           omattiedot={this.props.omattiedot}
                                           organisaatioSelectAction={this._onOrganisaatioSelection}
                                           organisaatioSelections={this.state.newKayttooikeusryhma.organisaatioSelections}></KayttooikeusryhmanMyontoKohde>

            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_MONNETAAN']}</h4>
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_SISALTAA']}</h4>

        </div>
    }

    _onOrganisaatioSelection = (selection: any) => {
        const organisaatios = this.state.newKayttooikeusryhma.organisaatioSelections;
        this.setState({newKayttooikeusryhma: {...this.state.newKayttooikeusryhma,
            organisaatioSelections: [...organisaatios, selection]}});
    };

    async createNewKayttooikeusryhma() {
        console.log(this.state);
    }

}