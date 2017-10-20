// @flow
import React from 'react';
import KayttooikeusryhmanMyontoKohde from './KayttooikeusryhmanMyontoKohde';
import type {KayttooikeusSelection, NewKayttooikeusryhma} from '../kayttooikeusryhmat.types';
import KayttooikeusryhmatNimi from './KayttooikeusryhmatNimi';
import KayttooikeusryhmatKuvaus from './KayttooikeusryhmatKuvaus';
import MyonnettavatKayttooikeusryhmat from './MyonnettavatKayttooikeusryhmat';
import KayttooikeusryhmatPalvelutJaKayttooikeudet from './KayttooikeusryhmatPalvelutJaKayttooikeudet';
import type {Locale} from '../../../types/locale.type';
import type {ReactSelectOption} from '../../../types/react-select.types';
import type {PalvelutState} from "../../../reducers/palvelut.reducer";
import type {KayttooikeusState} from "../../../reducers/kayttooikeus.reducer";

type Props = {
    L: any,
    omattiedot: any,
    koodisto: any,
    kayttooikeus: any,
    kayttooikeusState: KayttooikeusState,
    palvelutState: PalvelutState,
    locale: Locale,
    fetchPalveluKayttooikeus: (palveluName: string) => void
}

type State = {
    newKayttooikeusryhma: NewKayttooikeusryhma,
    palvelutSelection: ReactSelectOption | void,
    palveluKayttooikeusSelection: ReactSelectOption | void
};

export default class KayttooikeusryhmatLisaaPage extends React.Component<Props, State> {

    state = {
        newKayttooikeusryhma: {
            name: {fi: '', sv: '', en: ''},
            description: {fi: '', sv: '', en: ''},
            organisaatioSelections: [],
            oppilaitostyypitSelections: [],
            kayttooikeusryhmaSelections: [],
            palveluJaKayttooikeusSelections: []
        },
        palvelutSelection: undefined,
        palveluKayttooikeusSelection: undefined
    };

    render() {
        return <div className="wrapper">

            <KayttooikeusryhmatNimi {...this.props}
                                    name={this.state.newKayttooikeusryhma.name}
                                    setName={this._setName}></KayttooikeusryhmatNimi>

            <KayttooikeusryhmatKuvaus {...this.props}
                                      description={this.state.newKayttooikeusryhma.description}
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

            <KayttooikeusryhmatPalvelutJaKayttooikeudet {...this.props}
                                                        palvelutSelection={this.state.palvelutSelection}
                                                        palvelutSelectAction={this._onPalvelutSelection}
                                                        palveluJaKayttooikeusSelections={this.state.newKayttooikeusryhma.palveluJaKayttooikeusSelections}
                                                        palveluKayttooikeusSelectAction={this._onPalveluKayttooikeusSelection}
                                                        palveluKayttooikeusSelection={this.state.palveluKayttooikeusSelection}
                                                        lisaaPalveluJaKayttooikeusAction={this._onLisaaPalveluJaKayttooikeus}
                                                        removePalveluJaKayttooikeus={this._onRemovePalveluJaKayttooikeus}
            ></KayttooikeusryhmatPalvelutJaKayttooikeudet>

        </div>
    }

    _onOrganisaatioSelection = (selection: ReactSelectOption): void => {
        const currentOrganisaatioSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.organisaatioSelections;
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
        const newOrganisaatioSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.organisaatioSelections
            .filter(organisaatio => selection.value !== organisaatio.value);
        this.setState({
            newKayttooikeusryhma: {
                ...this.state.newKayttooikeusryhma,
                organisaatioSelections: newOrganisaatioSelections
            }
        });
    };

    _onOppilaitostyypitSelection = (selection: ReactSelectOption): void => {
        const currentOppilaitostyypitSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.oppilaitostyypitSelections;
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
        const newOppilaitostyypitSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.oppilaitostyypitSelections
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
        const currentKayttooikeusryhmaSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.kayttooikeusryhmaSelections;
        if (!currentKayttooikeusryhmaSelections.some((kayttooikeusryhma: ReactSelectOption) => kayttooikeusryhma.value === selection.value)) {
            this.setState({
                newKayttooikeusryhma: {
                    ...this.state.newKayttooikeusryhma,
                    kayttooikeusryhmaSelections: [...currentKayttooikeusryhmaSelections, selection]
                }
            });
        }
    };

    _onRemoveKayttooikeusryhmaSelect = (selection: ReactSelectOption): void => {
        const newKayttooikeusryhmaSelections: Array<ReactSelectOption> = this.state.newKayttooikeusryhma.kayttooikeusryhmaSelections
            .filter((kayttooikeusryhma: ReactSelectOption) => kayttooikeusryhma.value !== selection.value);
        this.setState({
            newKayttooikeusryhma: {
                ...this.state.newKayttooikeusryhma,
                kayttooikeusryhmaSelections: newKayttooikeusryhmaSelections
            }
        });
    };

    _onPalvelutSelection = (selection: ReactSelectOption): void => {
        this.setState({palvelutSelection: selection, palveluKayttooikeusSelection: undefined});
        this.props.fetchPalveluKayttooikeus(selection.value);
    };

    _onPalveluKayttooikeusSelection = (selection: ReactSelectOption): void => {
        this.setState({palveluKayttooikeusSelection: selection});
    };

    _onLisaaPalveluJaKayttooikeus = (): void => {
        const {palvelutSelection, palveluKayttooikeusSelection}: any = this.state;

        const newKayttoikeusSelection: KayttooikeusSelection = { palvelu: palvelutSelection, kayttooikeus: palveluKayttooikeusSelection };
        const currentKayttooikeusSelections = this.state.newKayttooikeusryhma.palveluJaKayttooikeusSelections;
        if (!currentKayttooikeusSelections.some((kayttooikeusSelection: KayttooikeusSelection) =>
                (kayttooikeusSelection.palvelu.value === newKayttoikeusSelection.palvelu.value &&
                    kayttooikeusSelection.kayttooikeus.value === newKayttoikeusSelection.kayttooikeus.value))) {
            console.log('adding', newKayttoikeusSelection);
            this.setState({
                newKayttooikeusryhma: {
                    ...this.state.newKayttooikeusryhma, palveluJaKayttooikeusSelections: [...currentKayttooikeusSelections, newKayttoikeusSelection]
                }
            })
        }
    };

    _onRemovePalveluJaKayttooikeus = (selection: ReactSelectOption): void => {
        console.log('remove');
    };

    async createNewKayttooikeusryhma() {
        console.log(this.state);
    }

}