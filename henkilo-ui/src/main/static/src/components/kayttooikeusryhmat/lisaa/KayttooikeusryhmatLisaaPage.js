// @flow
import React from 'react';

import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';

type Props = {
    L: any,
    organisaatio: any
}

type State = {
    selectedOrganisaatioOid: string | void,

};

export default class KayttooikeusryhmatLisaaPage extends React.Component<Props, State> {

    state = {
        selectedOrganisaatioOid: undefined
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
                                           organisaatioState={this.props.organisaatio}
                                            selectedOrganisaatioOid={this.state.selectedOrganisaatioOid}></KayttooikeusryhmanMyontoKohde>


            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_MONNETAAN']}</h4>
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_SISALTAA']}</h4>

        </div>
    }

    async createNewKayttooikeusryhma() {
        console.log(this.state);
    }

}