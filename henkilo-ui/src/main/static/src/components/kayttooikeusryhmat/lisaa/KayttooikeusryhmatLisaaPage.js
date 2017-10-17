// @flow
import React from 'react';
import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';
import type {NewKayttooikeusryhma} from '../kayttooikeusryhmat.types';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';

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
            organisaatioSelections: [],
            name: {fi: '', sv: '', en: ''},
            description: {fi: '', sv: '', en: ''}
        }
    };

    render() {
        return <div className="wrapper">

            <KayttooikeusryhmatNimi L={this.props.L} name={this.state.newKayttooikeusryhma.name}></KayttooikeusryhmatNimi>
            <KayttooikeusryhmatKuvaus L={this.props.L} description={this.state.newKayttooikeusryhma.description}></KayttooikeusryhmatKuvaus>

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