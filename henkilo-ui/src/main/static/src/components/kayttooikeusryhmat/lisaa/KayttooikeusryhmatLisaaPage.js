// @flow
import React from 'react';
import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';
import type {NewKayttooikeusryhma} from '../kayttooikeusryhmat.types';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import MyonnettavatKayttooikeusryhmat from './MyonnettavatKayttooikeusryhmat';
import type {Locale} from '../../../types/locale.type';
import type {ReactSelectOption} from '../../../types/react-select.types';

type Props = {
    L: any,
    omattiedot: any,
    koodisto: any,
    kayttooikeus: any,
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
            oppilaitostyypitSelections: [],
            kayttooikeusryhmaSelections: []
        }
    };

    render() {
        return <div className="wrapper">

            <KayttooikeusryhmatNimi {...this.props} name={this.state.newKayttooikeusryhma.name}
                                    setName={this._setName}></KayttooikeusryhmatNimi>
            <KayttooikeusryhmatKuvaus {...this.props} description={this.state.newKayttooikeusryhma.description}
                                      setDescription={this._setDescription}></KayttooikeusryhmatKuvaus>

            <KayttooikeusryhmanMyontoKohde {...this.props}
                                           organisaatioSelectAction={this._onOrganisaatioSelection}
                                           organisaatioSelections={this.state.newKayttooikeusryhma.organisaatioSelections}
                                           removeOrganisaatioSelectAction={this._onRemoveOrganisaatioSelect}

                                           oppilaitostyypitSelectAction={this._onOppilaitostyypitSelection}
                                           oppilaitostyypitSelections={this.state.newKayttooikeusryhma.oppilaitostyypitSelections}
                                           removeOppilaitostyypitSelectionAction={this._onRemoveOppilaitostyypitSelect}></KayttooikeusryhmanMyontoKohde>

            <MyonnettavatKayttooikeusryhmat {...this.props}
                                            kayttooikeusryhmaSelectAction={this._onKayttooikeusryhmaSelection}
                                            kayttooikeusryhmaSelections={this.state.newKayttooikeusryhma.kayttooikeusryhmaSelections}
                                            removeKayttooikeusryhmaSelectAction={this._onRemoveKayttooikeusryhmaSelect}
            ></MyonnettavatKayttooikeusryhmat>
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_MITA_SISALTAA']}</h4>

        </div>
    }

    _onOrganisaatioSelection = (selection: ReactSelectOption): void => {
        const currentOrganisaatioSelections = this.state.newKayttooikeusryhma.organisaatioSelections;
        if (!currentOrganisaatioSelections.some(organisaatio => organisaatio.value === selection.value)) {
            this.setState({
                newKayttooikeusryhma: {
                    ...this.state.newKayttooikeusryhma,
                    organisaatioSelections: [...currentOrganisaatioSelections, selection]
                }
            });
        }
    };

    _onRemoveOrganisaatioSelect = (selection: ReactSelectOption): void => {
        const newOrganisaatioSelections = this.state.newKayttooikeusryhma.organisaatioSelections
            .filter(organisaatio => selection.value !== organisaatio.value);
        this.setState({
            newKayttooikeusryhma: {
                ...this.state.newKayttooikeusryhma,
                organisaatioSelections: newOrganisaatioSelections
            }
        });
    };

    _onOppilaitostyypitSelection = (selection: ReactSelectOption): void => {
        const currentOppilaitostyypitSelections = this.state.newKayttooikeusryhma.oppilaitostyypitSelections;
        if (!currentOppilaitostyypitSelections.some((oppilaitostyyppi: ReactSelectOption) => oppilaitostyyppi.value === selection.value)) {
            this.setState({
                newKayttooikeusryhma: {
                    ...this.state.newKayttooikeusryhma,
                    oppilaitostyypitSelections: [...currentOppilaitostyypitSelections, selection]
                }
            });
        }
    };

    _onRemoveOppilaitostyypitSelect = (selection: ReactSelectOption): void => {
        const newOppilaitostyypitSelections = this.state.newKayttooikeusryhma.oppilaitostyypitSelections
            .filter((oppilaitostyyppi: ReactSelectOption) => selection.value !== oppilaitostyyppi.value);
        this.setState({
            newKayttooikeusryhma: {
                ...this.state.newKayttooikeusryhma,
                oppilaitostyypitSelections: newOppilaitostyypitSelections
            }
        });
    };

    _setName = (languageCode: string, value: string): void => {
        this.setState({
            newKayttooikeusryhma:
                {
                    ...this.state.newKayttooikeusryhma,
                    name: {...this.state.newKayttooikeusryhma.name, [languageCode]: value}
                }
        })
    };

    _setDescription = (languageCode: string, value: string): void => {
        this.setState({
            newKayttooikeusryhma:
                {
                    ...this.state.newKayttooikeusryhma,
                    description: {...this.state.newKayttooikeusryhma.description, [languageCode]: value}
                }
        })
    };

    _onKayttooikeusryhmaSelection = (selection: ReactSelectOption): void => {
        const currentKayttooikeusryhmaSelections = this.state.newKayttooikeusryhma.kayttooikeusryhmaSelections;
        if (!currentKayttooikeusryhmaSelections.some(kayttooikeusryhma => kayttooikeusryhma.value === selection.value)) {
            this.setState({
                newKayttooikeusryhma: {
                    ...this.state.newKayttooikeusryhma,
                    kayttooikeusryhmaSelections: [...currentKayttooikeusryhmaSelections, selection]
                }
            });
        }
    };

    _onRemoveKayttooikeusryhmaSelect = (selection: ReactSelectOption): void => {
        const newKayttooikeusryhmaSelections = this.state.newKayttooikeusryhma.kayttooikeusryhmaSelections
            .filter((kayttooikeusryhma: ReactSelectOption) => kayttooikeusryhma.value !== selection.value);
        this.setState({
            newKayttooikeusryhma: {
                ...this.state.newKayttooikeusryhma,
                kayttooikeusryhmaSelections: newKayttooikeusryhmaSelections
            }
        });
    };

    async createNewKayttooikeusryhma() {
        console.log(this.state);
    }

}