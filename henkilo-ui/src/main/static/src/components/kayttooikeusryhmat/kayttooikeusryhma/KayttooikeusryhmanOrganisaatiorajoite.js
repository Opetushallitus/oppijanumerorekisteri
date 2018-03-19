// @flow
import React from 'react';
import OphSelect from '../../common/select/OphSelect';
import ItemList from './ItemList';
import './KayttooikeusryhmanOrganisaatiorajoite.css';
import type {Locale} from "../../../types/locale.type";
import type {ReactSelectOption} from "../../../types/react-select.types";
import type {L} from "../../../types/localisation.type";
import {omattiedotOrganisaatiotToOrganisaatioSelectObject} from "../../../utilities/organisaatio.util";
import {OrganisaatioSelectModal} from "../../common/select/OrganisaatioSelectModal";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";

type Props = {
    L: L,
    organisaatios: Array<any>,
    koodisto: any,
    locale: Locale,
    ryhmaRestriction: boolean,
    toggleRyhmaRestriction: () => void,
    organisaatioSelections: Array<OrganisaatioSelectObject>,
    organisaatioSelectAction: (organisaatio: OrganisaatioSelectObject) => void,
    removeOrganisaatioSelectAction: (selection: OrganisaatioSelectObject) => void,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    oppilaitostyypitSelectAction: (selection: ReactSelectOption) => void,
    removeOppilaitostyypitSelectionAction: (selection: ReactSelectOption) => void,
    omattiedotOrganisaatiosLoading: boolean
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
                    <OrganisaatioSelectModal
                        L={this.props.L}
                        locale={this.props.locale}
                        disabled={this.props.omattiedotOrganisaatiosLoading || (this.props.organisaatios.length === 0)}
                        onSelect={this.props.organisaatioSelectAction}
                        organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.organisaatios, this.props.locale)}
                    ></OrganisaatioSelectModal>

                    <ItemList items={this.props.organisaatioSelections}
                              labelPath={['name']}
                              removeAction={this.props.removeOrganisaatioSelectAction}/>

                </div>
                <div className="flex-item-1 oppilaitostyyppi-wrapper">
                    <OphSelect id="oppilaitostyyppi"
                               options={this.state.oppilaitostyypitOptions}
                               placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_OPPILAITOSTYYPPI']}
                               onChange={this.props.oppilaitostyypitSelectAction}>
                    </OphSelect>
                    <ItemList items={this.props.oppilaitostyypitSelections}
                              labelPath={['label']}
                              removeAction={this.props.removeOppilaitostyypitSelectionAction}/>

                </div>
            </div>
        </div>

    }

}