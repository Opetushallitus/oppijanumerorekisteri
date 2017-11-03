// @flow
import React from 'react';
import OrganisaatioSelection from '../../common/select/OrganisaatioSelection';
import OphSelect from '../../common/select/OphSelect';
import ItemList from './ItemList';
import './KayttooikeusryhmanOrganisaatiorajoite.css';
import type {Locale} from "../../../types/locale.type";
import type {ReactSelectOption} from "../../../types/react-select.types";

type Props = {
    L: any,
    omattiedot: {organisaatios: any},
    koodisto: any,
    locale: Locale,
    ryhmaRestriction: boolean,
    toggleRyhmaRestriction: () => void,
    organisaatioSelections: Array<ReactSelectOption>,
    organisaatioSelectAction: (selection: ReactSelectOption) => void,
    removeOrganisaatioSelectAction: (selection: ReactSelectOption) => void,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    oppilaitostyypitSelectAction: (selection: ReactSelectOption) => void,
    removeOppilaitostyypitSelectionAction: (selection: ReactSelectOption) => void,
}

type State = {
    oppilaitostyypitOptions: Array<any>,
}

export default class KayttooikeusryhmanOrganisaatiorajoite extends React.Component<Props, State> {

    state = {
        oppilaitostyypitOptions: []
    };

    componentWillMount() {
        const oppilaitostyypitOptions: Array<ReactSelectOption> = this.props.koodisto.oppilaitostyypit.map(oppilaitostyyppi => ({label: oppilaitostyyppi[this.props.locale], value: oppilaitostyyppi.value}));
        this.setState({oppilaitostyypitOptions})
    }

    render() {
        return <div className="kayttooikeusryhman-myonto-kohde">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_ORGANISAATIORAJOITE_OTSIKKO']}</h4>
            <label className="oph-checkable" htmlFor="ryhmarestriction">
                <input id="ryhmarestriction" className="oph-checkable-input" type="checkbox" onChange={this.props.toggleRyhmaRestriction} checked={this.props.ryhmaRestriction} />
                <span className="oph-checkable-text">Käyttöoikeusryhmän saa myöntää ryhmälle</span>
            </label>

            <div className="flex-horizontal">

                <div className="flex-item-1 ">

                    <OrganisaatioSelection id="organisaatiofilter"
                                           organisaatios={this.props.omattiedot.organisaatios}
                                           selectOrganisaatio={this.props.organisaatioSelectAction}>
                    </OrganisaatioSelection>
                    <ItemList items={this.props.organisaatioSelections}
                              labelPath={['label']}
                              removeAction={this.props.removeOrganisaatioSelectAction}></ItemList>

                </div>
                <div className="flex-item-1 oppilaitostyyppi-wrapper">
                    <OphSelect id="oppilaitostyyppi"
                               options={this.state.oppilaitostyypitOptions}
                               placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_OPPILAITOSTYYPPI']}
                               onChange={this.props.oppilaitostyypitSelectAction}>
                    </OphSelect>
                    <ItemList items={this.props.oppilaitostyypitSelections}
                                labelPath={['label']}
                                removeAction={this.props.removeOppilaitostyypitSelectionAction}></ItemList>

                </div>
            </div>
        </div>

    }

}