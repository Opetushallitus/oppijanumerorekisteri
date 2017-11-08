// @flow
import React from 'react';
import './KayttooikeusryhmatPalvelutJaKayttooikeudet.css';
import type {ReactSelectOption} from "../../../types/react-select.types";
import OphSelect from '../../common/select/OphSelect';
import type {Locale} from "../../../types/locale.type";
import type {PalvelutState} from "../../../reducers/palvelut.reducer";
import R from 'ramda';
import type {KayttooikeusState} from "../../../reducers/kayttooikeus.reducer";
import type {PalveluKayttooikeus} from "../../../types/domain/kayttooikeus/palvelukayttooikeus.types";
import type {PalveluJaKayttooikeusSelection} from "./KayttooikeusryhmaPage";
import PalveluJaKayttooikeusSelections from "./PalveluJaKayttooikeusSelections";
import type {L} from "../../../types/l.type";

type Props = {
    L: L,
    locale: Locale,
    palvelutState: PalvelutState,
    kayttooikeusState: KayttooikeusState,
    palvelutSelectAction: (selection: ReactSelectOption) => void,
    palvelutSelection: ReactSelectOption,
    palveluKayttooikeusSelectAction: (selection: ReactSelectOption) => void,
    palveluKayttooikeusSelection: ReactSelectOption,
    lisaaPalveluJaKayttooikeusAction: () => void,
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>,
    removePalveluJaKayttooikeus: (PalveluJaKayttooikeusSelection) => void
}

type State = {
    palvelutOptions: Array<ReactSelectOption>,
    palveluKayttooikeusOptions: Array<ReactSelectOption>
};

export default class KayttooikeusryhmatPalvelutJaKayttooikeudet extends React.Component<Props, State> {

    state = {
        palvelutOptions: [],
        palveluKayttooikeusOptions: []
    };

    componentWillMount() {
        const lang = this.props.locale.toUpperCase();
        const palvelutOptions: Array<any> = this.props.palvelutState.palvelut.map(
            palvelu => {
                const textObject = R.find(R.propEq('lang', lang))(palvelu.description.texts);
                return {label: R.path(['text'], textObject), value: palvelu.name};
            });
        this.setState({palvelutOptions});
    }

    componentWillReceiveProps(nextProps: Props) {
        const lang = this.props.locale.toUpperCase();
        const palveluKayttooikeusOptions: Array<any> = nextProps.kayttooikeusState.palveluKayttooikeus.map(
            (palveluKayttooikeus: PalveluKayttooikeus) => {
                const textObject = R.find(R.propEq('lang', lang))(palveluKayttooikeus.oikeusLangs);
                return {label: R.path(['text'], textObject), value: palveluKayttooikeus.rooli}
            });
        this.setState({palveluKayttooikeusOptions});
    }

    render() {
        return <div className="kayttooikeusryhmat-palvelu-ja-kayttooikeudet">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELUT_JA_OIKEUDET']} *</h4>
            <div className="flex-horizontal">

                <div className="flex-item-1">
                    <OphSelect id="kayttooikeusryhmat-palvelut"
                               options={this.state.palvelutOptions}
                               value={this.props.palvelutSelection}
                               placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_PALVELU']}
                               onChange={this.props.palvelutSelectAction}></OphSelect>
                </div>

                <div className="flex-item-1 kayttooikeudet-wrapper">
                    <div className="flex-inline">
                        <div className="flex-item-1">
                            <OphSelect id="kayttooikeusryhmat-palvelu-kayttooikeudet"
                                       options={this.state.palveluKayttooikeusOptions}
                                       disabled={!this.props.palvelutSelection}
                                       value={this.props.palveluKayttooikeusSelection}
                                       placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUS']}
                                       onChange={this.props.palveluKayttooikeusSelectAction}></OphSelect>
                        </div>
                        <button className="oph-button add-button oph-button-primary" disabled={this.props.palvelutSelection === undefined || this.props.palveluKayttooikeusSelection === undefined}
                                onClick={() => this.props.lisaaPalveluJaKayttooikeusAction()}>{this.props.L['LISAA']}</button>
                    </div>
                </div>
            </div>
            <PalveluJaKayttooikeusSelections items={this.props.palveluJaKayttooikeusSelections}
                                             removeAction={this.props.removePalveluJaKayttooikeus}
                                             L={this.props.L}>
            </PalveluJaKayttooikeusSelections>


        </div>
    }

}