// @flow
import React from 'react';
import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';
import type {NewKayttooikeusryhma} from '../kayttooikeusryhmat.types';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import type {Locale} from "../../../types/locale.type";

type Props = {
    L: any,
    omattiedot: any,
    koodisto: any,
    locale: Locale
}

type State = {
    newKayttooikeusryhma: NewKayttooikeusryhma,
};

export default class KayttooikeusryhmatLisaaPage extends React.Component<Props, State> {

    state = {
        newKayttooikeusryhma: {
            name: {fi: '', sv: '', en: ''},
            description: {fi: '', sv: '', en: ''},
            organisaatioSelections: [],
            oppilaitostyypitSelections: []
        }
    };

    render() {
        return <div className="wrapper">

            <KayttooikeusryhmatNimi L={this.props.L} name={this.state.newKayttooikeusryhma.name} setName={this._setName}></KayttooikeusryhmatNimi>
            <KayttooikeusryhmatKuvaus L={this.props.L} description={this.state.newKayttooikeusryhma.description} setDescription={this._setDescription}></KayttooikeusryhmatKuvaus>

            <KayttooikeusryhmanMyontoKohde {...this.props}
                                           organisaatioSelectAction={this._onOrganisaatioSelection}
                                           organisaatioSelections={this.state.newKayttooikeusryhma.organisaatioSelections}
                                           removeOrganisaatioSelectAction={this._onRemoveOrganisaatioSelect}

                                           oppilaitostyypitSelectAction={this._onOppilaitostyypitSelection}
                                           oppilaitostyypitSelections={this.state.newKayttooikeusryhma.oppilaitostyypitSelections}
                                           removeOppilaitostyypitSelectionAction={this._onRemoveOppilaitostyypitSelect}></KayttooikeusryhmanMyontoKohde>

            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_MONNETAAN']}</h4>
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_SISALTAA']}</h4>

        </div>
    }

    _onOrganisaatioSelection = (selection: any): void => {
        const currentOrganisaatioSelections  = this.state.newKayttooikeusryhma.organisaatioSelections;
        if(!currentOrganisaatioSelections.some( organisaatio => organisaatio.value === selection.value)) {
            this.setState({newKayttooikeusryhma: {...this.state.newKayttooikeusryhma,
            organisaatioSelections: [...currentOrganisaatioSelections, selection]}});
        }
    };

    _onRemoveOrganisaatioSelect = (selection: any): void => {
        const newOrganisaatioSelections = this.state.newKayttooikeusryhma.organisaatioSelections
            .filter( organisaatio => selection.value !== organisaatio.value );
        this.setState({newKayttooikeusryhma: {...this.state.newKayttooikeusryhma,
            organisaatioSelections: newOrganisaatioSelections}});
    };

    _onOppilaitostyypitSelection = (selection: any): void => {
        const currentOppilaitostyypitSelections = this.state.newKayttooikeusryhma.oppilaitostyypitSelections;
        if(!currentOppilaitostyypitSelections.some( oppilaitostyyppi => oppilaitostyyppi.value === selection.value)) {
            this.setState({newKayttooikeusryhma: {...this.state.newKayttooikeusryhma,
                oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection]}});
        }
    };

    _onRemoveOppilaitostyypitSelect = (selection: any): void => {
        const newOppilaitostyypitSelections = this.state.newKayttooikeusryhma.oppilaitostyypitSelections
            .filter( oppilaitostyyppi => selection.value !== oppilaitostyyppi.value );
        this.setState({newKayttooikeusryhma: {...this.state.newKayttooikeusryhma,
            oppilaitostyypitSelections: newOppilaitostyypitSelections}});
    };

    _setName = (languageCode: string, value: string): void => {
        this.setState({newKayttooikeusryhma: 
                            {...this.state.newKayttooikeusryhma,
                                name: {...this.state.newKayttooikeusryhma.name, [languageCode]: value}}})
    };

    _setDescription = (languageCode: string, value:string): void => {
        this.setState({newKayttooikeusryhma:
            {...this.state.newKayttooikeusryhma,
                description: {...this.state.newKayttooikeusryhma.description, [languageCode]: value}}})
    };

    async createNewKayttooikeusryhma() {
        console.log(this.state);
    }

}